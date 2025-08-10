import axios from 'axios';
import { AppError } from '../../errors/AppError';

// Access Token 캐시(선택)
let cachedToken: { token: string; exp: number } | null = null;

async function getPortoneAccessToken(): Promise<string> {
  const { PORTONE_API_KEY, PORTONE_API_SECRET } = process.env;
  if (!PORTONE_API_KEY || !PORTONE_API_SECRET) {
    throw new AppError('포트원 API 키/시크릿이 설정되지 않았습니다.', 500, 'ServerConfig');
  }

  // 캐시 유효하면 재사용
  if (cachedToken && cachedToken.exp > Date.now() + 20_000) {
    return cachedToken.token;
  }

  const { data } = await axios.post('https://api.iamport.kr/users/getToken', {
    imp_key: PORTONE_API_KEY,
    imp_secret: PORTONE_API_SECRET,
  });

  if (data?.code !== 0 || !data?.response?.access_token) {
    throw new AppError('포트원 액세스 토큰 발급 실패', 502, 'BadGateway');
  }

  const token = data.response.access_token as string;
  const expiredAtSec = data.response.expired_at as number; // unix seconds
  cachedToken = { token, exp: expiredAtSec * 1000 };
  return token;
}

export type PortonePaymentVerified = {
  amount: number;
  merchant_uid: string;
  pg_provider?: string;
  paid_at?: number;
  name?: string;
  custom_data: any;
  raw: any;
};

// imp_uid로 포트원 결제 상세 조회 + 핵심 3요소 검증
export async function fetchAndVerifyPortonePayment(imp_uid: string, expected: {
  merchant_uid: string;
  amount: number; // 서버가 기대하는 금액
}): Promise<PortonePaymentVerified> {
  const accessToken = await getPortoneAccessToken();

  // V1은 Authorization 헤더에 토큰만(환경에 따라 Bearer도 동작하나 기본은 토큰만)
  const { data } = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
    headers: { Authorization: `${accessToken}` },
  });

  if (data?.code !== 0 || !data?.response) {
    throw new AppError('포트원 결제 조회 실패', 502, 'BadGateway');
  }

  const p = data.response;

  if (p.status !== 'paid') {
    throw new AppError('결제가 정상적으로 완료되지 않았습니다.', 400, 'BadRequest');
  }

  // 금액/주문번호 검증(위변조 방지)
  if (Number(p.amount) !== Number(expected.amount)) {
    throw new AppError('결제 금액 검증 실패', 400, 'BadRequest');
  }
  if (p.merchant_uid !== expected.merchant_uid) {
    throw new AppError('주문번호 검증 실패', 400, 'BadRequest');
  }

  let customData: any = p.custom_data;
  if (typeof customData === 'string') {
    try { customData = JSON.parse(customData); } catch { /* ignore */ }
  }

  return {
    amount: Number(p.amount),
    merchant_uid: p.merchant_uid,
    pg_provider: p.pg_provider,
    paid_at: p.paid_at,
    name: p.name,
    custom_data: customData,
    raw: p,
  };
}
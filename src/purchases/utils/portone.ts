import axios, { AxiosError} from 'axios';
import { AppError } from '../../errors/AppError';

let cachedToken: { token: string; exp: number } | null = null;

async function getPortoneAccessToken(): Promise<string> {
  const { PORTONE_API_KEY, PORTONE_API_SECRET } = process.env;
  if (!PORTONE_API_KEY || !PORTONE_API_SECRET) {
    throw new AppError('포트원 API 키/시크릿이 설정되지 않았습니다.', 500, 'ServerConfig');
  }

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
  const expiredAtSec = data.response.expired_at as number;
  cachedToken = { token, exp: expiredAtSec * 1000 };
  return token;
}

export type PortonePaymentVerified = {
  amount: number;
  merchant_uid: string;
  pg_provider: string;
  paid_at: number;
  name: string;
  custom_data: any;
  raw: any;
};

export async function fetchAndVerifyPortonePayment(
  imp_uid: string,
  expected: { merchant_uid: string; amount?: number }
): Promise<PortonePaymentVerified> {
  try {
    const accessToken = await getPortoneAccessToken();

    const { data } = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Bearer 필수
        Accept: 'application/json',
      },
      timeout: 10_000,
    });

    if (data?.code !== 0 || !data?.response) {
      throw new AppError('포트원 결제 조회 실패', 502, 'BadGateway');
    }

    const p = data.response;

    if (p.status !== 'paid') {
      throw new AppError('결제가 정상적으로 완료되지 않았습니다.', 400, 'BadRequest');
    }

    if (typeof expected?.amount === 'number') {
      if (Number(p.amount) !== Number(expected.amount)) {
        throw new AppError('결제 금액 검증 실패', 400, 'BadRequest');
      }
    }

    if (p.merchant_uid !== expected.merchant_uid) {
      throw new AppError('주문번호 검증 실패', 400, 'BadRequest');
    }

    let customData: any = p.custom_data;
    if (typeof customData === 'string') {
      try { customData = JSON.parse(customData); } catch {}
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
  } catch (err: any) {
     if (err instanceof AppError) {
    console.error('[PortOne verify -> AppError]', {
      statusCode: err.statusCode,
      name: err.name,
      message: err.message,
    });
    throw err;
  }
    
     // Axios 에러 분기
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 500;
    const data = err.response?.data;
    console.error('[PortOne verify -> AxiosError]', {
      status,
      data,
      url: err.config?.url,
      reqHeaders: err.config?.headers,
      msg: err.message,
    });
    const msg =
      data?.message ||
      data?.error?.message ||
      err.message ||
      'PortOne verify failed';
    throw new AppError(msg, status, status === 401 ? 'Unauthorized' : 'BadGateway');
  }

  // 그 외 일반 에러도 메시지/스택을 남기고 그대로 던짐
  console.error('[PortOne verify error - non axios]', {
    name: err?.name, message: err?.message, stack: err?.stack,
  });
  throw err; // 혹은 throw new AppError(err?.message || 'Unknown error', 500, 'Internal');
  }
}
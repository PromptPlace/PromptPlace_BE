import axios from 'axios';
import redisClient from '../../config/redis';
import { AppError } from '../../errors/AppError';
import { redactPaypleLog, buildPaypleHeaders } from './payple';

// Payple 결제 취소(환불) 유틸.
// PCD_PAYCANCEL_FLAG=Y로 파트너 인증 → 응답의 PCD_PAY_HOST + PCD_PAY_URL로 취소 요청.
//
// 보안 정책:
//  - Auth 캐시 TTL 15분 (정산 조회용과 동일)
//  - cstId/custKey는 캐시 제외, 매 호출 env 직접 로드
//  - 요청/응답 로그는 redactPaypleLog로 마스킹 (PCD_REFUND_KEY/PCD_AUTH_KEY 등)

const AUTH_CACHE_KEY = 'payple:refund:auth';
const AUTH_CACHE_TTL_SECONDS = 15 * 60;

interface PaypleRefundAuthCache {
  authKey: string;
  payHost: string;
  payUrl: string;
}

interface PaypleRefundAuth extends PaypleRefundAuthCache {
  cstId: string;
  custKey: string;
}

const loadCredentialsFromEnv = (): { cstId: string; custKey: string; refundKey: string } => {
  const cstId = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;
  const refundKey = process.env.PAYPLE_REFUND_KEY;
  if (!cstId || !custKey || !refundKey) {
    throw new AppError(
      'Payple 환불 설정이 누락되었습니다 (CST_ID / CUST_KEY / REFUND_KEY).',
      500,
      'ConfigError',
    );
  }
  return { cstId, custKey, refundKey };
};

const getCpayBaseUrl = (): string => {
  const url = process.env.PAYPLE_CPAY_URL;
  if (!url) {
    throw new AppError('PAYPLE_CPAY_URL 환경변수가 설정되지 않았습니다.', 500, 'ConfigError');
  }
  return url;
};

const getRefundAuthPath = (): string =>
  process.env.PAYPLE_REFUND_AUTH_PATH || '/php/auth.php';

const fetchRefundAuth = async (): Promise<PaypleRefundAuth> => {
  const { cstId, custKey } = loadCredentialsFromEnv();

  const cached = await redisClient.get(AUTH_CACHE_KEY);
  if (cached) {
    try {
      const parsed: PaypleRefundAuthCache = JSON.parse(cached);
      if (parsed.authKey && parsed.payHost && parsed.payUrl) {
        return { ...parsed, cstId, custKey };
      }
    } catch {
      // 캐시 손상 — 재발급
    }
  }

  const url = `${getCpayBaseUrl()}${getRefundAuthPath()}`;
  const res = await axios.post(
    url,
    { cst_id: cstId, custKey, PCD_PAYCANCEL_FLAG: 'Y' },
    { headers: buildPaypleHeaders() },
  );

  if (res.data?.result !== 'success') {
    console.error('[payple-refund] auth failed', { code: res.data?.result });
    throw new AppError('Payple 환불 인증에 실패했습니다.', 502, 'PaypleAuthFailed');
  }

  const cacheable: PaypleRefundAuthCache = {
    authKey: res.data.AuthKey,
    payHost: res.data.PCD_PAY_HOST,
    payUrl: res.data.PCD_PAY_URL,
  };
  await redisClient.set(AUTH_CACHE_KEY, JSON.stringify(cacheable), { EX: AUTH_CACHE_TTL_SECONDS });
  return { ...cacheable, cstId, custKey };
};

export interface RequestRefundParams {
  payOid: string;          // PCD_PAY_OID — Payment.pcd_pay_oid
  payDate: string;         // PCD_PAY_DATE — yyyyMMdd (원거래 결제일)
  refundTotal: number;     // PCD_REFUND_TOTAL — 환불 금액 (원거래보다 작으면 부분취소)
}

export interface PaypleRefundResult {
  payCode: string;          // PCD_PAY_CODE (e.g. PAYC0000)
  payMsg: string;
  cardTradeNum?: string;    // PCD_PAY_CARDTRADENUM (감사 추적)
  refundTotal: number;
  payTime: string;          // PCD_PAY_TIME yyyyMMddHHmmss
}

// 결제 취소(환불) 요청.
// Payple 응답 PCD_PAY_RST가 'success'가 아니면 AppError.
export const requestPaypleRefund = async (
  params: RequestRefundParams,
): Promise<PaypleRefundResult> => {
  const { refundKey } = loadCredentialsFromEnv();
  const auth = await fetchRefundAuth();

  const body = {
    PCD_CST_ID: auth.cstId,
    PCD_CUST_KEY: auth.custKey,
    PCD_AUTH_KEY: auth.authKey,
    PCD_REFUND_KEY: refundKey,
    PCD_PAYCANCEL_FLAG: 'Y',
    PCD_PAY_OID: params.payOid,
    PCD_PAY_DATE: params.payDate,
    PCD_REFUND_TOTAL: String(params.refundTotal),
  };

  const url = `${auth.payHost}${auth.payUrl}`;
  let res;
  try {
    res = await axios.post(url, body, {
      headers: buildPaypleHeaders(),
    });
  } catch (err: any) {
    console.error('[payple-refund] request network error', {
      response: redactPaypleLog(err?.response?.data),
    });
    throw new AppError('Payple 환불 요청 통신에 실패했습니다.', 502, 'PaypleRefundFailed');
  }

  if (res.data?.PCD_PAY_RST !== 'success') {
    console.error('[payple-refund] request rejected', {
      code: res.data?.PCD_PAY_CODE,
      response: redactPaypleLog(res.data),
    });
    throw new AppError(
      `Payple 환불에 실패했습니다. (${res.data?.PCD_PAY_CODE ?? 'UNKNOWN'}) ${res.data?.PCD_PAY_MSG ?? ''}`,
      502,
      'PaypleRefundFailed',
    );
  }

  return {
    payCode: res.data.PCD_PAY_CODE,
    payMsg: res.data.PCD_PAY_MSG,
    cardTradeNum: res.data.PCD_PAY_CARDTRADENUM,
    refundTotal: Number(res.data.PCD_REFUND_TOTAL),
    payTime: res.data.PCD_PAY_TIME,
  };
};

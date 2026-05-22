import axios from 'axios';
import redisClient from '../../config/redis';
import { AppError } from '../../errors/AppError';
import { redactPaypleLog } from './payple';

// Payple 빌링키 라이프사이클 (#491 후속 작업 대비).
// 본 파일은 빌링키 조회(PUSERINFO) / 해지(PUSERDEL) 인프라만 정의.
// 호출 흐름: 파트너 인증 → AuthKey/PCD_PAY_URL 수신 → 조회/해지 요청.
//
// 보안 정책 (#482/#485과 동일):
//  - Auth 캐시 TTL 25분 (Payple 30분 만료 마진)
//  - cstId/custKey는 캐시에서 제외하고 매 호출 env 직접 로드
//  - 요청/응답 로그는 redactPaypleLog로 마스킹

type BillingWork = 'PUSERINFO' | 'PUSERDEL';

const AUTH_CACHE_TTL_SECONDS = 25 * 60;

interface BillingAuthCache {
  authKey: string;
  payHost: string;
  payUrl: string;
}

interface BillingAuth extends BillingAuthCache {
  cstId: string;
  custKey: string;
}

const loadCredentialsFromEnv = (): { cstId: string; custKey: string } => {
  const cstId = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;
  if (!cstId || !custKey) {
    throw new AppError('Payple 인증 설정이 누락되었습니다.', 500, 'ConfigError');
  }
  return { cstId, custKey };
};

const getCpayBaseUrl = (): string => {
  const url = process.env.PAYPLE_CPAY_URL;
  if (!url) {
    throw new AppError('PAYPLE_CPAY_URL 환경변수가 설정되지 않았습니다.', 500, 'ConfigError');
  }
  return url;
};

const getBillingAuthPath = (): string =>
  process.env.PAYPLE_BILLING_AUTH_PATH || '/php/auth.php';

const fetchBillingAuth = async (work: BillingWork): Promise<BillingAuth> => {
  const { cstId, custKey } = loadCredentialsFromEnv();
  const cacheKey = `payple:billing:auth:${work}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    try {
      const parsed: BillingAuthCache = JSON.parse(cached);
      if (parsed.authKey && parsed.payHost && parsed.payUrl) {
        return { ...parsed, cstId, custKey };
      }
    } catch {
      // 캐시 손상 — 재발급
    }
  }

  const url = `${getCpayBaseUrl()}${getBillingAuthPath()}`;
  const res = await axios.post(
    url,
    { cst_id: cstId, custKey, PCD_PAY_WORK: work },
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } },
  );

  if (res.data?.result !== 'success') {
    console.error('[payple-billing] auth failed', { work, code: res.data?.result });
    throw new AppError(`Payple 빌링키 ${work} 인증에 실패했습니다.`, 502, 'PaypleAuthFailed');
  }

  const cacheable: BillingAuthCache = {
    authKey: res.data.AuthKey,
    payHost: res.data.PCD_PAY_HOST,
    payUrl: res.data.PCD_PAY_URL,
  };
  await redisClient.set(cacheKey, JSON.stringify(cacheable), { EX: AUTH_CACHE_TTL_SECONDS });
  return { ...cacheable, cstId, custKey };
};

export interface BillingKeyInfo {
  payCode: string;
  payMsg: string;
  payType: string;            // 'card' | 'transfer'
  payerId: string;            // 조회한 빌링키
  payerName?: string;
  payerHp?: string;
  cardCode?: string;          // PCD_PAY_CARD
  cardName?: string;          // PCD_PAY_CARDNAME
  cardNumMasked?: string;     // PCD_PAY_CARDNUM
}

// 빌링키 조회 (PUSERINFO).
// 카드 빌링키의 경우 마스킹된 카드번호/카드사명 반환.
export const fetchBillingKeyInfo = async (payerId: string): Promise<BillingKeyInfo> => {
  if (!payerId) {
    throw new AppError('payerId(빌링키)가 누락되었습니다.', 400, 'ValidationError');
  }
  const auth = await fetchBillingAuth('PUSERINFO');

  const url = `${auth.payHost}${auth.payUrl}`;
  const res = await axios.post(
    url,
    {
      PCD_CST_ID: auth.cstId,
      PCD_CUST_KEY: auth.custKey,
      PCD_AUTH_KEY: auth.authKey,
      PCD_PAYER_ID: payerId,
    },
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } },
  );

  if (res.data?.PCD_PAY_RST !== 'success') {
    console.error('[payple-billing] info failed', {
      code: res.data?.PCD_PAY_CODE,
      response: redactPaypleLog(res.data),
    });
    throw new AppError(
      `Payple 빌링키 조회에 실패했습니다. (${res.data?.PCD_PAY_CODE ?? 'UNKNOWN'})`,
      502,
      'PaypleBillingInfoFailed',
    );
  }

  return {
    payCode: res.data.PCD_PAY_CODE,
    payMsg: res.data.PCD_PAY_MSG,
    payType: res.data.PCD_PAY_TYPE,
    payerId: res.data.PCD_PAYER_ID,
    payerName: res.data.PCD_PAYER_NAME,
    payerHp: res.data.PCD_PAYER_HP,
    cardCode: res.data.PCD_PAY_CARD,
    cardName: res.data.PCD_PAY_CARDNAME,
    cardNumMasked: res.data.PCD_PAY_CARDNUM,
  };
};

export interface BillingKeyDeleteResult {
  payCode: string;
  payMsg: string;
  payType: string;
  payerId: string;
}

// 빌링키 해지 (PUSERDEL).
// 카드/계좌 빌링키를 영구 비활성화. 환불/탈퇴 흐름에서 사용.
export const deleteBillingKey = async (payerId: string): Promise<BillingKeyDeleteResult> => {
  if (!payerId) {
    throw new AppError('payerId(빌링키)가 누락되었습니다.', 400, 'ValidationError');
  }
  const auth = await fetchBillingAuth('PUSERDEL');

  const url = `${auth.payHost}${auth.payUrl}`;
  const res = await axios.post(
    url,
    {
      PCD_CST_ID: auth.cstId,
      PCD_CUST_KEY: auth.custKey,
      PCD_AUTH_KEY: auth.authKey,
      PCD_PAYER_ID: payerId,
    },
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } },
  );

  if (res.data?.PCD_PAY_RST !== 'success') {
    console.error('[payple-billing] delete failed', {
      code: res.data?.PCD_PAY_CODE,
      response: redactPaypleLog(res.data),
    });
    throw new AppError(
      `Payple 빌링키 해지에 실패했습니다. (${res.data?.PCD_PAY_CODE ?? 'UNKNOWN'})`,
      502,
      'PaypleBillingDeleteFailed',
    );
  }

  return {
    payCode: res.data.PCD_PAY_CODE,
    payMsg: res.data.PCD_PAY_MSG,
    payType: res.data.PCD_PAY_TYPE,
    payerId: res.data.PCD_PAYER_ID,
  };
};

import axios from 'axios';
import redisClient from '../../config/redis';
import { AppError } from '../../errors/AppError';

// Payple 정산내역 조회용 파트너 인증 + 조회 유틸.
// 정산내역 조회는 PCD_SETTLEMENT_FLAG=Y로 인증 받고, 응답의 PCD_PAY_HOST + PCD_PAY_URL로 호출.
// 호출 제한: 1초 1회 / 2분 20회 (호출자가 throttling 책임).
//
// 본 이슈에서는 인프라만 추가. 외부 endpoint 노출 없음. 향후 정산 완료 동기화/검증/리포트에 재사용.

const AUTH_CACHE_KEY = 'payple:settlement:auth';
// Payple 토큰 만료 정책이 명세상 불분명 — 안전하게 25분 캐시 (보통 30분 만료 가정)
const AUTH_CACHE_TTL_SECONDS = 25 * 60;

interface PaypleSettlementAuth {
  cstId: string;
  custKey: string;
  authKey: string;
  payHost: string;
  payUrl: string;
}

const getCpayBaseUrl = (): string => {
  const url = process.env.PAYPLE_CPAY_URL;
  if (!url) {
    throw new AppError('PAYPLE_CPAY_URL 환경변수가 설정되지 않았습니다.', 500, 'ConfigError');
  }
  return url;
};

// 정산 인증 endpoint path는 Payple 환경/계약에 따라 다를 수 있어 env로 분리.
// 명세상 명시되지 않아 sandbox 테스트로 확정 필요.
const getSettlementAuthPath = (): string =>
  process.env.PAYPLE_SETTLEMENT_AUTH_PATH || '/php/auth.php';

export const fetchPaypleSettlementAuth = async (): Promise<PaypleSettlementAuth> => {
  const cached = await redisClient.get(AUTH_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // 캐시 손상 — 재발급
    }
  }

  const cst_id = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;
  if (!cst_id || !custKey) {
    throw new AppError('Payple 인증 설정이 누락되었습니다.', 500, 'ConfigError');
  }

  const url = `${getCpayBaseUrl()}${getSettlementAuthPath()}`;
  const res = await axios.post(
    url,
    { cst_id, custKey, PCD_SETTLEMENT_FLAG: 'Y' },
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } },
  );

  if (res.data?.result !== 'success') {
    console.error('[payple-settlement] auth failed', { code: res.data?.result });
    throw new AppError('Payple 정산내역 조회 인증에 실패했습니다.', 502, 'PaypleAuthFailed');
  }

  const auth: PaypleSettlementAuth = {
    cstId: res.data.cst_id,
    custKey: res.data.custKey,
    authKey: res.data.AuthKey,
    payHost: res.data.PCD_PAY_HOST,
    payUrl: res.data.PCD_PAY_URL,
  };
  await redisClient.set(AUTH_CACHE_KEY, JSON.stringify(auth), { EX: AUTH_CACHE_TTL_SECONDS });
  return auth;
};

export type PaypleMethod = 'CARD' | 'EASYPAY' | 'TRANSFER';
export type PaypleTxnType = 'APPROVAL' | 'CANCEL';
export type PaypleResponsePayType = 'card' | 'easypay' | 'transfer';

export interface FetchSettlementsParams {
  startDate: string;        // yyyy-MM-dd 또는 yyyyMMdd
  endDate: string;          // 최대 31일 범위
  method?: PaypleMethod;
  limit?: number;           // 기본 100, 최소 1, 최대 3000
  lastKey?: string;         // 페이지네이션 커서
}

export interface PaypleSettlementItem {
  txnType: PaypleTxnType;
  payOid: string;
  payTime: string;
  payCancelTime: string | null;
  settleDate: string;
  payType: PaypleResponsePayType;
  payerName: string;
  payGoods: string;
  payAmount: number;
  feeSupply: number;
  feeVat: number;
  feeTotal: number;
  settleAmount: number;
}

export interface PaypleSettlementsPage {
  items: PaypleSettlementItem[];
  hasMore: boolean;
  lastKey: string | null;
  totals: {
    count: number;
    approvalAmount: number;
    cancelAmount: number;
    feeAmount: number;
    settleAmount: number;
  };
}

export const fetchPaypleSettlements = async (
  params: FetchSettlementsParams,
): Promise<PaypleSettlementsPage> => {
  const auth = await fetchPaypleSettlementAuth();

  const body: Record<string, unknown> = {
    PCD_CST_ID: auth.cstId,
    PCD_CUST_KEY: auth.custKey,
    PCD_AUTH_KEY: auth.authKey,
    PCD_SETTLEMENT_FLAG: 'Y',
    PCD_START_DATE: params.startDate,
    PCD_END_DATE: params.endDate,
  };
  if (params.method) body.PCD_METHOD = params.method;
  if (params.limit) body.PCD_LIMIT = params.limit;
  if (params.lastKey) body.PCD_LASTKEY = params.lastKey;

  const url = `${auth.payHost}${auth.payUrl}`;
  const res = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });

  if (res.data?.PCD_PAY_RST !== 'success') {
    console.error('[payple-settlement] query failed', { code: res.data?.PCD_PAY_CODE });
    throw new AppError(
      `Payple 정산내역 조회에 실패했습니다. (${res.data?.PCD_PAY_CODE ?? 'UNKNOWN'})`,
      502,
      'PaypleSettlementQueryFailed',
    );
  }

  const content: any[] = res.data?.PCD_DATA?.PCD_CONTENT ?? [];
  const totals = res.data?.PCD_DATA?.PCD_PAGE_TOTALS ?? {};

  return {
    items: content.map((item) => ({
      txnType: item.PCD_TXN_TYPE,
      payOid: item.PCD_PAY_OID,
      payTime: item.PCD_PAY_TIME,
      payCancelTime: item.PCD_PAY_CANCEL_TIME ?? null,
      settleDate: item.PCD_SETTLE_DATE,
      payType: item.PCD_PAY_TYPE,
      payerName: item.PCD_PAYER_NAME,
      payGoods: item.PCD_PAY_GOODS,
      payAmount: item.PCD_PAY_AMOUNT,
      feeSupply: item.PCD_FEE_SUPPLY,
      feeVat: item.PCD_FEE_VAT,
      feeTotal: item.PCD_FEE_TOTAL,
      settleAmount: item.PCD_SETTLE_AMOUNT,
    })),
    hasMore: !!res.data?.PCD_DATA?.PCD_HAS_MORE,
    lastKey: res.data?.PCD_DATA?.PCD_LASTKEY ?? null,
    totals: {
      count: totals.PCD_TOTAL_COUNT ?? 0,
      approvalAmount: totals.PCD_TOTAL_APPROVAL_AMOUNT ?? 0,
      cancelAmount: totals.PCD_TOTAL_CANCEL_AMOUNT ?? 0,
      feeAmount: totals.PCD_TOTAL_FEE_AMOUNT ?? 0,
      settleAmount: totals.PCD_TOTAL_SETTLE_AMOUNT ?? 0,
    },
  };
};

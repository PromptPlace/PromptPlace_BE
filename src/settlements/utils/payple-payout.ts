import axios from 'axios';
import { AppError } from '../../errors/AppError';
import {
  fetchPaypleAccessToken,
  buildPaypleHeaders,
  redactPaypleLog,
} from './payple';

// Payple 정산지급대행(Hub Payout) API 클라이언트 (#491 PR C).
//
// Endpoint (https://docs.payple.kr/integration/hub/payout):
//   POST {HUB}/oauth/token              — 파트너 인증 (60초 토큰)
//   POST {HUB}/inquiry/real_name        — 계좌인증 (billing_tran_id 발급, PR B에서 사용)
//   POST {HUB}/transfer/request         — 이체 대기 요청 (group_key 발급)
//   POST {HUB}/transfer/execute         — 이체 실행 (NOW) / 대기 취소 (CANCEL)
//   POST {HUB}/request/result/group_key — 이체대기 조회
//   POST {HUB}/transfer/result          — 건별 결과 조회
//   POST {HUB}/transfer/result/date     — 일별 결과 조회
//   POST {HUB}/transfer/result/group_key— 그룹별 결과 조회
//   POST {HUB}/account/remain           — 잔액 조회
//
// HUB = demohub.payple.kr (test) / hub.payple.kr (live) — PAYPLE_HUB_URL env로 분리
//
// 본 PR은 유틸만 추가. 외부 endpoint 노출/cron은 PR D에서.

const getHubBaseUrl = (): string => {
  const url = process.env.PAYPLE_HUB_URL;
  if (!url) throw new AppError('PAYPLE_HUB_URL 환경변수가 설정되지 않았습니다.', 500, 'ConfigError');
  return url;
};

const loadCredentials = (): { cstId: string; custKey: string } => {
  const cstId = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;
  if (!cstId || !custKey) {
    throw new AppError('Payple 인증 설정이 누락되었습니다.', 500, 'ConfigError');
  }
  return { cstId, custKey };
};

const postWithToken = async <T = any>(
  path: string,
  body: Record<string, unknown>,
  context: string,
): Promise<T> => {
  const accessToken = await fetchPaypleAccessToken();
  const url = `${getHubBaseUrl()}${path}`;
  try {
    const res = await axios.post(url, body, {
      headers: buildPaypleHeaders({ Authorization: `Bearer ${accessToken}` }),
    });
    if (res.data?.result && res.data.result !== 'A0000') {
      console.error(`[payple-payout] ${context} rejected`, {
        code: res.data.result,
        response: redactPaypleLog(res.data),
      });
      throw new AppError(
        `Payple ${context} 호출에 실패했습니다. (${res.data.result})`,
        502,
        'PaypleHubFailed',
      );
    }
    return res.data as T;
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    console.error(`[payple-payout] ${context} network error`, {
      code: err?.response?.data?.result,
      response: redactPaypleLog(err?.response?.data),
    });
    throw new AppError(
      `Payple ${context} 호출 중 통신 오류가 발생했습니다.`,
      502,
      'PaypleHubFailed',
    );
  }
};

// =============== 이체 대기 요청 (POST /transfer/request) ===============
export interface PayoutStandbyParams {
  billingTranId: string;
  tranAmt: number;            // sandbox는 1000 고정
  subId?: string;
  distinctKey?: string;       // 중복 방지 키 (미입력 시 Payple 자동 발급)
  printContent?: string;      // 입금 인자 (최대 6자)
}

export interface PayoutStandbyResult {
  cstId: string;
  subId?: string;
  distinctKey: string;
  groupKey: string;
  billingTranId: string;
  tranAmt: string;
  remainAmt: string;
  printContent?: string;
  apiTranDtm: string;
}

export const requestPayoutStandby = async (params: PayoutStandbyParams): Promise<PayoutStandbyResult> => {
  const { cstId, custKey } = loadCredentials();
  const body: Record<string, unknown> = {
    cst_id: cstId,
    custKey,
    billing_tran_id: params.billingTranId,
    tran_amt: String(params.tranAmt),
  };
  if (params.subId) body.sub_id = params.subId;
  if (params.distinctKey) body.distinct_key = params.distinctKey;
  if (params.printContent) body.print_content = params.printContent;

  const data = await postWithToken<Record<string, any>>('/transfer/request', body, '이체대기요청');
  return {
    cstId: data.cst_id,
    subId: data.sub_id,
    distinctKey: data.distinct_key,
    groupKey: data.group_key,
    billingTranId: data.billing_tran_id,
    tranAmt: data.tran_amt,
    remainAmt: data.remain_amt,
    printContent: data.print_content,
    apiTranDtm: data.api_tran_dtm,
  };
};

// =============== 이체 실행 (POST /transfer/execute) — NOW / CANCEL ===============
export type ExecuteType = 'NOW' | 'CANCEL';

export interface PayoutExecuteParams {
  groupKey: string;
  billingTranId: string;          // 'ALL' 또는 특정 빌링키
  executeType: ExecuteType;
  webhookUrl?: string;            // 테스트 환경에서만 필수
}

export interface PayoutExecuteResult {
  cstId: string;
  groupKey: string;
  billingTranId: string;
  totTranAmt: string;
  remainAmt: string;
  executeType: ExecuteType;
  apiTranDtm: string;
}

export const executePayout = async (params: PayoutExecuteParams): Promise<PayoutExecuteResult> => {
  const { cstId, custKey } = loadCredentials();
  const body: Record<string, unknown> = {
    cst_id: cstId,
    custKey,
    group_key: params.groupKey,
    billing_tran_id: params.billingTranId,
    execute_type: params.executeType,
  };
  if (params.webhookUrl) body.webhook_url = params.webhookUrl;

  const data = await postWithToken<Record<string, any>>('/transfer/execute', body, '이체실행');
  return {
    cstId: data.cst_id,
    groupKey: data.group_key,
    billingTranId: data.billing_tran_id,
    totTranAmt: data.tot_tran_amt,
    remainAmt: data.remain_amt,
    executeType: data.execute_type as ExecuteType,
    apiTranDtm: data.api_tran_dtm,
  };
};

// =============== 이체대기 조회 (POST /request/result/group_key) ===============
export const inquireStandbyByGroup = async (groupKey: string): Promise<Record<string, any>> => {
  const { cstId, custKey } = loadCredentials();
  return postWithToken('/request/result/group_key', { cst_id: cstId, custKey, group_key: groupKey }, '이체대기조회');
};

// =============== 건별 결과 조회 (POST /transfer/result) ===============
export const inquireResultByCase = async (apiTranId: string): Promise<Record<string, any>> => {
  const { cstId, custKey } = loadCredentials();
  return postWithToken('/transfer/result', { cst_id: cstId, custKey, api_tran_id: apiTranId }, '건별결과조회');
};

// =============== 일별 결과 조회 (POST /transfer/result/date) ===============
// bankTranDate: YYYYMMDD
export const inquireResultByDay = async (bankTranDate: string): Promise<Record<string, any>> => {
  const { cstId, custKey } = loadCredentials();
  return postWithToken('/transfer/result/date', { cst_id: cstId, custKey, bank_tran_date: bankTranDate }, '일별결과조회');
};

// =============== 그룹별 결과 조회 (POST /transfer/result/group_key) ===============
export const inquireResultByGroup = async (groupKey: string): Promise<Record<string, any>> => {
  const { cstId, custKey } = loadCredentials();
  return postWithToken('/transfer/result/group_key', { cst_id: cstId, custKey, group_key: groupKey }, '그룹별결과조회');
};

// =============== 잔액 조회 (POST /account/remain) ===============
export const fetchRemainingBalance = async (): Promise<Record<string, any>> => {
  const { cstId, custKey } = loadCredentials();
  return postWithToken('/account/remain', { cst_id: cstId, custKey }, '잔액조회');
};

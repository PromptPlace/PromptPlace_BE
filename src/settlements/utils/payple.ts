import axios from 'axios';
import crypto from 'crypto';
import { AppError } from '../../errors/AppError';
import redisClient from '../../config/redis';
import { isValidPaypleBank } from '../constants/bank';

export type SellerTypeHint = 'INDIVIDUAL' | 'BUSINESS_PERSONAL' | 'BUSINESS_CORPORATE';

interface PaypleErrorResponse {
  result: string;
  message: string;
}

export class AccountVerificationError extends AppError {
  public subCode: string;

  constructor(message: string, subCode: string) {
    super(message, 400, 'AccountVerificationError');
    this.subCode = subCode;
    this.name = this.constructor.name;
  }
}

// 민감 정보 redactor — 로그에 노출되면 안 되는 필드
const REDACTED_FIELDS = new Set([
  // 실명인증/은행/토큰
  'account_num',
  'account_holder_info',
  'custKey',
  'cst_id',
  'billing_tran_id',
  'bank_tran_id',
  'access_token',
  // 정산내역 조회 (payple-settlement.ts에서 재사용)
  'PCD_CUST_KEY',
  'PCD_AUTH_KEY',
  'PCD_CST_ID',
  'PCD_PAYER_NAME',
  'PCD_PAY_BANKNUM',
  'PCD_PAY_CARDNUM',
  'PCD_LASTKEY',
  'AuthKey',
  // 결제 취소 (payple-refund.ts에서 재사용)
  'PCD_REFUND_KEY',
  'PCD_PAYER_ID',
  'PCD_PAY_CARDTRADENUM',
]);

const redactValue = (v: unknown): string => {
  if (typeof v !== 'string') return '***';
  return v.length > 4 ? `${v.slice(0, 2)}***${v.slice(-2)}` : '***';
};

export const redactPaypleLog = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') return payload;
  if (Array.isArray(payload)) return payload.map(redactPaypleLog);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
    if (REDACTED_FIELDS.has(k)) {
      out[k] = redactValue(v);
    } else if (v && typeof v === 'object') {
      out[k] = redactPaypleLog(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

// Redis 일일 5회 인증 제한 — SET NX EX로 race condition 제거
const RATE_LIMIT_PER_DAY = 5;

const getSecondsUntilMidnight = (): number => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

export const consumePaypleRateLimit = async (userId: number): Promise<void> => {
  const key = `payple_limit:${userId}`;
  const ttl = getSecondsUntilMidnight();
  // NX + EX를 한 번의 atomic 호출로. 키가 없으면 0으로 초기화 + TTL.
  await redisClient.set(key, '0', { NX: true, EX: ttl });
  const next = await redisClient.incr(key);
  if (next > RATE_LIMIT_PER_DAY) {
    throw new AccountVerificationError(
      '일일 계좌 인증 횟수를 초과했습니다. 보안을 위해 내일 다시 시도해 주세요.',
      'LIMIT_EXCEEDED',
    );
  }
};

// Payple OAuth 토큰 발급
const fetchPaypleAccessToken = async (): Promise<string> => {
  const PAYPLE_HUB_URL = process.env.PAYPLE_HUB_URL;
  const cst_id = process.env.PAYPLE_CST_ID;
  const custKey = process.env.PAYPLE_CUST_KEY;
  if (!PAYPLE_HUB_URL || !cst_id || !custKey) {
    throw new AccountVerificationError(
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      'SYSTEM_ERROR',
    );
  }

  const code = crypto.randomBytes(5).toString('hex');
  const res = await axios.post(
    `${PAYPLE_HUB_URL}/oauth/token`,
    { cst_id, custKey, code },
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } },
  );

  if (res.data.result !== 'T0000') {
    console.error('[payple] oauth failed', { code: res.data.result });
    throw new AccountVerificationError(
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      'SYSTEM_ERROR',
    );
  }
  return res.data.access_token as string;
};

export interface PaypleVerifyParams {
  userId: number;
  sellerType: 'INDIVIDUAL' | 'BUSINESS';
  businessType?: 'PERSONAL' | 'CORPORATE';
  bank: string;
  accountNumber: string;
  holderName: string;
  birthDate?: string;
  businessNumber?: string;
}

const toSellerHint = (sellerType: 'INDIVIDUAL' | 'BUSINESS', businessType?: 'PERSONAL' | 'CORPORATE'): SellerTypeHint => {
  if (sellerType === 'INDIVIDUAL') return 'INDIVIDUAL';
  return businessType === 'CORPORATE' ? 'BUSINESS_CORPORATE' : 'BUSINESS_PERSONAL';
};

// Payple 실명-계좌 일치 인증.
// 개인 / 개인사업자 → account_holder_info_type='0', account_holder_info=birthDate(YYMMDD)
// 법인사업자       → account_holder_info_type='6', account_holder_info=businessNumber(10자리)
export const verifyRealNameWithPayple = async (
  params: PaypleVerifyParams,
): Promise<{ accountHolderName: string }> => {
  const { userId, sellerType, businessType, bank, accountNumber, holderName, birthDate, businessNumber } = params;

  if (!isValidPaypleBank(bank)) {
    throw new AccountVerificationError(
      '유효하지 않은 계좌번호이거나 지원하지 않는 은행입니다.',
      'BANK_MISMATCH',
    );
  }

  let holderInfoType: '0' | '6';
  let holderInfo: string;
  if (sellerType === 'BUSINESS' && businessType === 'CORPORATE') {
    if (!businessNumber || !/^\d{10}$/.test(businessNumber)) {
      throw new AccountVerificationError(
        '입력하신 사업자등록번호가 올바르지 않습니다. 10자리 숫자로 다시 입력해 주세요.',
        'INVALID_BUSINESS_NUMBER',
      );
    }
    holderInfoType = '6';
    holderInfo = businessNumber;
  } else {
    if (!birthDate || !/^\d{6}$/.test(birthDate)) {
      throw new AccountVerificationError(
        '입력하신 생년월일이 올바르지 않습니다. YYMMDD 형식으로 다시 입력해 주세요.',
        'INVALID_BIRTHDATE',
      );
    }
    holderInfoType = '0';
    holderInfo = birthDate;
  }

  const PAYPLE_HUB_URL = process.env.PAYPLE_HUB_URL!;
  const cst_id = process.env.PAYPLE_CST_ID!;
  const custKey = process.env.PAYPLE_CUST_KEY!;
  const accessToken = await fetchPaypleAccessToken();
  const sellerHint = toSellerHint(sellerType, businessType);

  let res;
  try {
    res = await axios.post(
      `${PAYPLE_HUB_URL}/inquiry/real_name`,
      {
        cst_id,
        custKey,
        sub_id: `user_${userId}`,
        bank_code_std: bank,
        account_num: accountNumber,
        account_holder_info_type: holderInfoType,
        account_holder_info: holderInfo,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      },
    );
  } catch (err: any) {
    if (err?.response?.data) {
      const parsed = parseAccountVerificationError(err.response.data, sellerHint);
      console.error('[payple] verify http error', { code: err.response.data?.result });
      throw new AccountVerificationError(parsed.message, parsed.subCode);
    }
    console.error('[payple] verify network error');
    throw new AccountVerificationError(
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      'SYSTEM_ERROR',
    );
  }

  if (res.data.result !== 'A0000') {
    const parsed = parseAccountVerificationError(res.data, sellerHint);
    console.error('[payple] verify rejected', { code: res.data.result });
    throw new AccountVerificationError(parsed.message, parsed.subCode);
  }

  if (res.data.account_holder_name !== holderName) {
    throw new AccountVerificationError(
      '실명/대표자명과 예금주명이 일치하지 않습니다. 다시 확인해주세요.',
      'NAME_MISMATCH',
    );
  }

  return { accountHolderName: res.data.account_holder_name as string };
};

// Payple 실명인증 응답을 사용자 모달 8종 + 신규 3종(INVALID_BIRTHDATE / INVALID_BUSINESS_NUMBER / SYSTEM_ERROR)으로 매핑.
// sellerHint는 N0112(holder_info 값 오류)에서 생년월일 vs 사업자번호 모달로 분기하기 위한 힌트.
export const parseAccountVerificationError = (
  paypleResponse: PaypleErrorResponse,
  sellerHint?: SellerTypeHint,
) => {
  const code = paypleResponse.result;
  const msg = paypleResponse.message || '';

  // 모달 7: 점검 시간
  if (code === 'T0996' || code === 'T0997') {
    return {
      subCode: 'BANK_MAINTENANCE',
      message: '현재 은행 정기 점검 시간(가능시간 : 01시 ~ 23시)입니다. 점검 종료 후 다시 시도해 주세요.',
    };
  }

  // 모달 2: 은행 코드 오류 / 계좌번호 형식 오류
  if (['N0101', 'N0102', 'N0103'].includes(code) || msg.includes('기관코드')) {
    return {
      subCode: 'BANK_MISMATCH',
      message: '선택하신 은행과 계좌번호가 일치하지 않습니다. 은행명을 다시 확인해 주세요.',
    };
  }

  // 모달 6: 통신/지연/내부 처리 오류
  if (
    ['A0001', 'A0002', 'A0003', 'A0007', 'A0099', 'A0999'].includes(code) ||
    msg.includes('타임아웃')
  ) {
    return {
      subCode: 'BANK_TIMEOUT',
      message: '해당 은행과의 통신이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  // 모달 3: 해당 계좌 없음
  if (code === 'N0198' || msg.includes('해당계좌 없음(412)')) {
    return {
      subCode: 'ACCOUNT_NOT_FOUND',
      message: '해당 계좌는 존재하지 않는 계좌입니다. 다시 확인해주세요.',
    };
  }

  // 신규 모달 A: 생년월일 형식 오류
  if (code === 'N0120') {
    return {
      subCode: 'INVALID_BIRTHDATE',
      message: '입력하신 생년월일이 올바르지 않습니다. YYMMDD 형식으로 다시 입력해 주세요.',
    };
  }

  // 신규 모달 B: 사업자등록번호 형식 오류
  if (code === 'N0130') {
    return {
      subCode: 'INVALID_BUSINESS_NUMBER',
      message: '입력하신 사업자등록번호가 올바르지 않습니다. 10자리 숫자로 다시 입력해 주세요.',
    };
  }

  // N0112: account_holder_info 값 오류 — sellerHint로 분기
  if (code === 'N0112') {
    if (sellerHint === 'BUSINESS_CORPORATE') {
      return {
        subCode: 'INVALID_BUSINESS_NUMBER',
        message: '입력하신 사업자등록번호가 올바르지 않습니다. 10자리 숫자로 다시 입력해 주세요.',
      };
    }
    return {
      subCode: 'INVALID_BIRTHDATE',
      message: '입력하신 생년월일이 올바르지 않습니다. YYMMDD 형식으로 다시 입력해 주세요.',
    };
  }

  // A0009 세부 분기 — 모달 1 / 4 / 5
  if (code === 'A0009') {
    if (msg.includes('예금주명 불일치(815)')) {
      return {
        subCode: 'NAME_MISMATCH',
        message: '실명/대표자명과 예금주명이 일치하지 않습니다. 다시 확인해주세요.',
      };
    }
    if (
      msg.includes('해약 계좌(415)') ||
      msg.includes('사고 신고계좌(419)') ||
      msg.includes('거래중지 계좌(420)')
    ) {
      return {
        subCode: 'ACCOUNT_RESTRICTED',
        message: '입력하신 계좌는 현재 정상적인 거래가 불가능한 상태입니다. 은행 확인 후 다시 시도해 주세요.',
      };
    }
    if (msg.includes('잡좌(416)') || msg.includes('기타 처리불가(499)')) {
      return {
        subCode: 'UNSUPPORTED_TYPE',
        message: '해당 계좌는 정산용으로 등록할 수 없는 유형입니다. 원화 입출금이 가능한 보통예금 계좌로 다시 시도해 주세요.',
      };
    }
    if (msg.includes('해당계좌 없음(412)')) {
      return {
        subCode: 'ACCOUNT_NOT_FOUND',
        message: '해당 계좌는 존재하지 않는 계좌입니다. 다시 확인해주세요.',
      };
    }
  }

  // 신규 모달 C: 시스템 오류 (개발자/인프라/Payple 내부)
  if (
    ['N0111', 'N0199', 'N0499', 'T1999'].includes(code) ||
    /^T0\d{3}$/.test(code)
  ) {
    return {
      subCode: 'SYSTEM_ERROR',
      message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  // fallback
  return {
    subCode: 'UNKNOWN_VERIFICATION_ERROR',
    message: msg || '계좌 인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
  };
};

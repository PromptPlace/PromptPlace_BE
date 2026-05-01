import axios from 'axios';
import { AppError } from '../../errors/AppError';

export type PayplePayType = 'card' | 'transfer';
export type PayplePayWork = 'PAY' | 'CERT';

export interface PaypleAuthResponse {
  result: string;
  result_msg: string;
  cst_id: string;
  custKey: string;
  AuthKey: string;
  PCD_PAY_HOST: string;
  PCD_PAY_URL: string;
  return_url: string;
}

export interface PaypleAuthResult {
  authKey: string;
  payHost: string;
  payUrl: string;
  returnUrl: string;
}

export async function requestPaypleAuth(
  payType: PayplePayType = 'card',
  payWork: PayplePayWork = 'PAY'
): Promise<PaypleAuthResult> {
  const { PAYPLE_CPAY_URL, PAYPLE_PAY_CST_ID, PAYPLE_PAY_CUST_KEY, PAYPLE_REFERER } = process.env;

  if (!PAYPLE_CPAY_URL || !PAYPLE_PAY_CST_ID || !PAYPLE_PAY_CUST_KEY) {
    throw new AppError('페이플 결제 환경변수가 설정되지 않았습니다.', 500, 'ServerConfig');
  }

  try {
    const { data } = await axios.post<PaypleAuthResponse>(
      `${PAYPLE_CPAY_URL}/php/auth.php`,
      {
        cst_id: PAYPLE_PAY_CST_ID,
        custKey: PAYPLE_PAY_CUST_KEY,
        PCD_PAY_TYPE: payType,
        PCD_PAY_WORK: payWork,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(PAYPLE_REFERER ? { Referer: PAYPLE_REFERER } : {}),
        },
        timeout: 10_000,
      }
    );

    if (data.result !== 'success') {
      throw new AppError(`페이플 인증 실패: ${data.result_msg}`, 502, 'BadGateway');
    }

    return {
      authKey: data.AuthKey,
      payHost: data.PCD_PAY_HOST,
      payUrl: data.PCD_PAY_URL,
      returnUrl: data.return_url,
    };
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 502;
      const msg = err.response?.data?.result_msg || err.message;
      console.error('[Payple Auth Error]', { status, msg });
      throw new AppError(`페이플 인증 요청 실패: ${msg}`, 502, 'BadGateway');
    }
    throw new AppError('페이플 인증 중 알 수 없는 오류 발생', 500, 'InternalServerError');
  }
}

export interface PayplePaymentResult {
  PCD_PAY_RST: 'success' | 'error' | 'close';
  PCD_PAY_CODE: string;
  PCD_PAY_MSG: string;
  PCD_PAY_OID: string;
  PCD_PAY_TYPE: string;
  PCD_PAY_TOTAL: string | number;
  PCD_PAY_TIME?: string;
  PCD_PAY_GOODS?: string;
  PCD_PAYER_NO?: string;
  PCD_PAYER_NAME?: string;
  PCD_PAYER_EMAIL?: string;
  PCD_PAY_CARDNAME?: string;
  PCD_PAY_CARDNUM?: string;
  PCD_PAY_CARDQUOTA?: string;
  PCD_PAY_BANKNAME?: string;
  PCD_PAY_BANKNUM?: string;
  PCD_PAY_REQKEY?: string;
  PCD_AUTH_KEY?: string;
  PCD_PAY_HOST?: string;
  PCD_PAY_URL?: string;
  PCD_PAY_ISTAX?: string;
  PCD_PAY_TAXTOTAL?: string | number;
  PCD_PAY_CARDRECEIPT?: string;
  PCD_USER_DEFINE1?: string;
  PCD_USER_DEFINE2?: string;
}

export type PaypleVerifiedPayment = {
  payOid: string;
  reqKey: string;
  authKey: string;
  amount: number;
  payType: string;
  paidAt: Date;
  cardName?: string | null;
  cardNum?: string | null;
  cardQuota?: string | null;
  bankName?: string | null;
  bankNum?: string | null;
  cashReceiptUrl?: string | null;
  customData: { prompt_id?: number; user_id?: number };
};

function parseCustomDefine(define?: string): any {
  if (!define) return {};
  try {
    return JSON.parse(define);
  } catch {
    return {};
  }
}

function parsePaypleTime(t?: string): Date {
  if (!t) return new Date();
  const m = t.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!m) return new Date(t);
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+09:00`);
}

export async function verifyPayplePayment(
  result: PayplePaymentResult,
  expected: { amount: number }
): Promise<PaypleVerifiedPayment> {
  const { PAYPLE_PAY_CST_ID, PAYPLE_PAY_CUST_KEY, PAYPLE_REFERER } = process.env;

  if (!PAYPLE_PAY_CST_ID || !PAYPLE_PAY_CUST_KEY) {
    throw new AppError('페이플 결제 환경변수가 설정되지 않았습니다.', 500, 'ServerConfig');
  }

  if (result.PCD_PAY_RST !== 'success') {
    throw new AppError(
      `결제가 완료되지 않았습니다. (${result.PCD_PAY_CODE}: ${result.PCD_PAY_MSG})`,
      400,
      'PaymentNotPaid'
    );
  }

  const reqKey = result.PCD_PAY_REQKEY;
  const authKey = result.PCD_AUTH_KEY;
  const payHost = result.PCD_PAY_HOST;
  const payUrl = result.PCD_PAY_URL;

  if (!reqKey || !authKey || !payHost || !payUrl) {
    throw new AppError('페이플 결제 검증에 필요한 키가 누락되었습니다.', 400, 'InvalidPaymentData');
  }

  let verified: PayplePaymentResult;
  try {
    const { data } = await axios.post<PayplePaymentResult>(
      `${payHost}${payUrl}`,
      {
        PCD_CST_ID: PAYPLE_PAY_CST_ID,
        PCD_CUST_KEY: PAYPLE_PAY_CUST_KEY,
        PCD_AUTH_KEY: authKey,
        PCD_PAY_REQKEY: reqKey,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(PAYPLE_REFERER ? { Referer: PAYPLE_REFERER } : {}),
        },
        timeout: 10_000,
      }
    );
    verified = data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 502;
      const msg = err.response?.data?.PCD_PAY_MSG || err.message;
      console.error('[Payple Verify Error]', { status, msg });
      throw new AppError(`페이플 검증 실패: ${msg}`, 502, 'BadGateway');
    }
    throw new AppError('결제 검증 중 알 수 없는 오류 발생', 500, 'InternalServerError');
  }

  if (verified.PCD_PAY_RST !== 'success') {
    throw new AppError(
      `페이플 재검증 실패 (${verified.PCD_PAY_CODE}: ${verified.PCD_PAY_MSG})`,
      400,
      'PaymentNotPaid'
    );
  }

  const verifiedAmount = Number(verified.PCD_PAY_TOTAL);
  if (Number.isNaN(verifiedAmount)) {
    throw new AppError('페이플 결제 금액 파싱 실패', 502, 'BadGateway');
  }
  if (expected.amount !== -1 && verifiedAmount !== expected.amount) {
    throw new AppError('결제 금액 검증 실패 (위변조 의심)', 400, 'PaymentAmountMismatch');
  }

  const customData = {
    ...parseCustomDefine(verified.PCD_USER_DEFINE1),
    ...parseCustomDefine(verified.PCD_USER_DEFINE2),
  };

  return {
    payOid: verified.PCD_PAY_OID,
    reqKey,
    authKey,
    amount: verifiedAmount,
    payType: verified.PCD_PAY_TYPE,
    paidAt: parsePaypleTime(verified.PCD_PAY_TIME),
    cardName: verified.PCD_PAY_CARDNAME ?? null,
    cardNum: verified.PCD_PAY_CARDNUM ?? null,
    cardQuota: verified.PCD_PAY_CARDQUOTA ?? null,
    bankName: verified.PCD_PAY_BANKNAME ?? null,
    bankNum: verified.PCD_PAY_BANKNUM ?? null,
    cashReceiptUrl: verified.PCD_PAY_CARDRECEIPT ?? null,
    customData,
  };
}

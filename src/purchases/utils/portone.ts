import axios from 'axios';
import { AppError } from '../../errors/AppError';

interface PortOnePaymentResponse {
  id: string; // paymentId
  status: "VIRTUAL_ACCOUNT_ISSUED" | "PAID" | "FAILED" | "CANCELLED" | "PARTIAL_CANCELLED";
  amount: {
    total: number;
    taxFree: number;
    vat: number;
    paid: number;
    cancelled: number;
  };
  orderName: string;
  cashReceipt?: {
    type: "DEDUCTION" | "PROOF" | "NONE";
    url: string;
    issueNumber: string;
    currency: string;
    amount: number;
  };
  customData?: string; 
  requestedAt: string;
  paidAt?: string;
}

export type PortonePaymentVerified = {
  paymentId: string;
  amount: number;
  status: string;  
  paidAt: Date;
  customData: any;
  cashReceipt?: {
    type: string;
    url: string;
  } | null;
};

export async function fetchAndVerifyPortonePayment(
  paymentId: string,
  expected: { amount: number }
): Promise<PortonePaymentVerified> {
  const { PORTONE_API_SECRET } = process.env;

  if (!PORTONE_API_SECRET) {
    throw new AppError('포트원 API 시크릿이 설정되지 않았습니다.', 500, 'ServerConfig');
  }

  try {
    // 1. 포트원 결제 단건 조회
    const { data } = await axios.get<PortOnePaymentResponse>(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${PORTONE_API_SECRET}`,
          'Content-Type': 'application/json',
        },
        timeout: 10_000,
      }
    );

    if (!data) {
      throw new AppError('포트원 결제 조회 응답이 비어있습니다.', 502, 'BadGateway');
    }

    const payment = data;

    // 2. 상태 검증 (PAID 상태여야 함)
    if (payment.status !== 'PAID') {
      throw new AppError(`결제가 완료되지 않았습니다. (Status: ${payment.status})`, 400, 'PaymentNotPaid');
    }

    // 3. 금액 검증
    if (expected.amount !== -1 && payment.amount.total !== expected.amount) {
      throw new AppError('결제 금액 검증 실패 (위변조 의심)', 400, 'PaymentAmountMismatch');
    }

    // 4. Custom Data 파싱
    let parsedCustomData: any = {};
    if (payment.customData) {
      try {
        parsedCustomData = JSON.parse(payment.customData);
      } catch (e) {
        console.warn('Custom Data Parsing Failed', payment.customData);
      }
    }

    // 5. 현금영수증 데이터 추출
    let cashReceiptInfo = null;
    if (payment.cashReceipt) {
        cashReceiptInfo = {
            type: payment.cashReceipt.type,
            url: payment.cashReceipt.url
        };
    }

    return {
      paymentId: payment.id,
      amount: payment.amount.total,
      status: payment.status,     
      paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
      customData: parsedCustomData,
      cashReceipt: cashReceiptInfo
    };

  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 500;
      const errorMsg = err.response?.data?.message || err.message;
      console.error('[PortOne V2 Verify Error]', { status, errorMsg });
      
      if (status === 404) throw new AppError('존재하지 않는 결제 내역입니다.', 404, 'NotFound');
      if (status === 401) throw new AppError('포트원 인증 실패 (API Key Check Required)', 500, 'ServerConfig');
      
      throw new AppError(`포트원 검증 실패: ${errorMsg}`, 502, 'BadGateway');
    }
    
    if (err instanceof AppError) throw err;

    throw new AppError('결제 검증 중 알 수 없는 오류 발생', 500, 'InternalServerError');
  }
}
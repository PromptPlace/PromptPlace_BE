import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import {
  RefundEligibilityResponseDto,
  RefundResultDto,
  RefundRequestResultDto,
} from '../dtos/refund.dto';
import { requestPaypleRefund } from '../../settlements/utils/payple-refund';
import { checkAutoRefund, checkManualRefund, toPolicyInput } from '../utils/refund-policy';

// 정책 판정에 필요한 필드 — 목록 API도 동일한 필드를 읽도록 여기서 공개한다. (#533)
export const PURCHASE_POLICY_SELECT = {
  purchase_id: true,
  user_id: true,
  amount: true,
  created_at: true,
  downloaded_at: true,
  is_free: true,
  payment: {
    select: { payment_id: true, pcd_pay_oid: true, created_at: true, status: true },
  },
  refund: { select: { refund_id: true, status: true } },
} as const;

const loadPurchase = async (purchaseId: number) =>
  prisma.purchase.findUnique({
    where: { purchase_id: purchaseId },
    select: PURCHASE_POLICY_SELECT,
  });

export const formatYyyymmdd = (date: Date): string => {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

// 결제 취소 성공 후 Payment/Settlement 상태 전이. 자동 환불과 관리자 승인이 공유.
export const markPaymentRefunded = async (
  tx: Prisma.TransactionClient,
  paymentId: number,
): Promise<void> => {
  await tx.payment.update({
    where: { payment_id: paymentId },
    data: { status: 'Refunded' },
  });
  // Settlement이 있는 경우만 (status 무관하게) Refunded로 전이
  await tx.settlement.updateMany({
    where: { payment_id: paymentId },
    data: { status: 'Refunded' },
  });
};

export const getRefundEligibility = async (
  userId: number,
  purchaseId: number,
): Promise<RefundEligibilityResponseDto> => {
  const purchase = await loadPurchase(purchaseId);
  if (!purchase) {
    return {
      message: '환불 불가',
      eligible: false,
      reason: 'NOT_PURCHASED',
      refund_deadline: null,
      manual_refund_available: false,
      manual_refund_deadline: null,
      statusCode: 200,
    };
  }

  const input = toPolicyInput(purchase);
  const auto = checkAutoRefund(input, userId);
  const manual = checkManualRefund(input, userId);

  return {
    message: auto.eligible ? '환불 가능' : '환불 불가',
    eligible: auto.eligible,
    reason: auto.reason,
    remaining_seconds: auto.remaining_seconds,
    refund_deadline: auto.refund_deadline,
    manual_refund_available: manual.eligible,
    manual_refund_deadline: manual.refund_deadline,
    statusCode: 200,
  };
};

// 열람 전 + 7일 이내 자동 환불 — 즉시 Payple 취소까지 수행.
export const refundPurchase = async (
  userId: number,
  purchaseId: number,
): Promise<RefundResultDto> => {
  const purchase = await loadPurchase(purchaseId);
  if (!purchase) {
    throw new AppError('환불 불가: NOT_PURCHASED', 400, 'RefundNotEligible');
  }

  const verdict = checkAutoRefund(toPolicyInput(purchase), userId);
  if (!verdict.eligible) {
    throw new AppError(`환불 불가: ${verdict.reason}`, 400, 'RefundNotEligible');
  }
  if (!purchase.payment) {
    throw new AppError('환불 대상 결제 정보를 찾을 수 없습니다.', 404, 'NotFound');
  }
  const payment = purchase.payment;

  // Payple 결제 취소 호출 (실패 시 DB는 손대지 않음)
  const paypleResult = await requestPaypleRefund({
    payOid: payment.pcd_pay_oid,
    payDate: formatYyyymmdd(payment.created_at),
    refundTotal: purchase.amount,
  });

  // 성공 시 DB 정합화 — Refund row 생성 + Payment/Settlement 상태 전이
  const refund = await prisma.$transaction(async (tx) => {
    // 트랜잭션 내부에서도 멱등 검사: 이미 환불 row 있으면 그대로 반환
    const existing = await tx.refund.findUnique({ where: { purchase_id: purchaseId } });
    if (existing) return existing;

    const created = await tx.refund.create({
      data: {
        purchase_id: purchase.purchase_id,
        payment_id: payment.payment_id,
        user_id: purchase.user_id,
        amount: purchase.amount,
        initiator: 'USER',
        reason: '7일 이내 미열람 자동 환불',
        status: 'COMPLETED',
        refunded_at: new Date(),
        payple_pay_code: paypleResult.payCode,
        payple_card_trade_num: paypleResult.cardTradeNum ?? null,
      },
    });

    await markPaymentRefunded(tx, payment.payment_id);

    return created;
  });

  return {
    message: '환불이 완료되었습니다.',
    refund_id: refund.refund_id,
    refunded_amount: refund.amount,
    refunded_at: (refund.refunded_at ?? new Date()).toISOString(),
    statusCode: 200,
  };
};

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

// 열람 후 수동 환불 신청 — 담당자 검토 대기 상태로만 기록하고 결제 취소는 하지 않는다.
export const requestManualRefund = async (
  userId: number,
  purchaseId: number,
  reason: string,
): Promise<RefundRequestResultDto> => {
  const trimmed = (reason ?? '').trim();
  if (trimmed.length < MIN_REASON_LENGTH || trimmed.length > MAX_REASON_LENGTH) {
    throw new AppError(
      `환불 사유는 ${MIN_REASON_LENGTH}자 이상 ${MAX_REASON_LENGTH}자 이하로 입력해주세요.`,
      400,
      'ValidationError',
    );
  }

  const purchase = await loadPurchase(purchaseId);
  if (!purchase) {
    throw new AppError('환불 신청 불가: NOT_PURCHASED', 400, 'RefundNotEligible');
  }

  const input = toPolicyInput(purchase);
  const verdict = checkManualRefund(input, userId);
  if (!verdict.eligible) {
    // 미열람 + 7일 이내라면 검토 없이 즉시 환불받을 수 있으므로 그쪽으로 안내한다.
    if (verdict.reason === 'NOT_DOWNLOADED' && checkAutoRefund(input, userId).eligible) {
      throw new AppError(
        '아직 열람하지 않은 구매 건은 검토 없이 즉시 환불받을 수 있습니다. 환불하기를 이용해주세요.',
        400,
        'UseAutoRefund',
      );
    }
    throw new AppError(`환불 신청 불가: ${verdict.reason}`, 400, 'RefundNotEligible');
  }
  if (!purchase.payment) {
    throw new AppError('환불 대상 결제 정보를 찾을 수 없습니다.', 404, 'NotFound');
  }

  let refund;
  try {
    refund = await prisma.refund.create({
      data: {
        purchase_id: purchase.purchase_id,
        payment_id: purchase.payment.payment_id,
        user_id: purchase.user_id,
        amount: purchase.amount,
        initiator: 'USER',
        reason: '열람 후 환불 신청',
        request_reason: trimmed,
        status: 'REQUESTED',
      },
    });
  } catch (err) {
    // 동시 신청 경합 — purchase_id/payment_id unique 충돌은 "이미 신청됨"으로 돌려준다.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError('이미 접수된 환불 신청이 있습니다.', 409, 'RefundAlreadyRequested');
    }
    throw err;
  }

  return {
    message: '환불 신청이 접수되었습니다. 담당자 확인 후 처리됩니다.',
    refund_id: refund.refund_id,
    status: 'REQUESTED',
    requested_at: refund.requested_at.toISOString(),
    statusCode: 200,
  };
};

import prisma from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import {
  RefundEligibilityResponseDto,
  RefundResultDto,
  RefundIneligibleReason,
} from '../dtos/refund.dto';
import { requestPaypleRefund } from '../../settlements/utils/payple-refund';

const REFUND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface EligibilityResult {
  eligible: boolean;
  reason?: RefundIneligibleReason;
  remaining_seconds?: number;
}

const checkEligibility = async (userId: number, purchaseId: number): Promise<EligibilityResult> => {
  const purchase = await prisma.purchase.findUnique({
    where: { purchase_id: purchaseId },
    select: {
      user_id: true,
      created_at: true,
      downloaded_at: true,
      is_free: true,
      payment: { select: { status: true } },
      refund: { select: { refund_id: true } },
    },
  });

  if (!purchase) {
    return { eligible: false, reason: 'NOT_PURCHASED' };
  }
  if (purchase.user_id !== userId) {
    return { eligible: false, reason: 'NOT_OWNER' };
  }
  if (purchase.is_free) {
    return { eligible: false, reason: 'FREE_PURCHASE' };
  }
  if (!purchase.payment || purchase.payment.status !== 'Succeed') {
    return { eligible: false, reason: 'PAYMENT_NOT_SUCCEEDED' };
  }
  if (purchase.refund) {
    return { eligible: false, reason: 'ALREADY_REFUNDED' };
  }
  if (purchase.downloaded_at) {
    return { eligible: false, reason: 'ALREADY_DOWNLOADED' };
  }

  const elapsed = Date.now() - purchase.created_at.getTime();
  if (elapsed >= REFUND_WINDOW_MS) {
    return { eligible: false, reason: 'EXPIRED_7DAYS' };
  }

  return {
    eligible: true,
    remaining_seconds: Math.floor((REFUND_WINDOW_MS - elapsed) / 1000),
  };
};

export const getRefundEligibility = async (
  userId: number,
  purchaseId: number,
): Promise<RefundEligibilityResponseDto> => {
  const result = await checkEligibility(userId, purchaseId);
  return {
    message: result.eligible ? '환불 가능' : '환불 불가',
    eligible: result.eligible,
    reason: result.reason,
    remaining_seconds: result.remaining_seconds,
    statusCode: 200,
  };
};

const formatYyyymmdd = (date: Date): string => {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

export const refundPurchase = async (
  userId: number,
  purchaseId: number,
): Promise<RefundResultDto> => {
  // 환불 가능 여부 재검증 (TOCTOU 차단을 위해 트랜잭션 안에서도 다시 검사)
  const preCheck = await checkEligibility(userId, purchaseId);
  if (!preCheck.eligible) {
    throw new AppError(`환불 불가: ${preCheck.reason}`, 400, 'RefundNotEligible');
  }

  // Payple 호출 전에 필요한 정보 로드
  const purchase = await prisma.purchase.findUnique({
    where: { purchase_id: purchaseId },
    select: {
      purchase_id: true,
      user_id: true,
      amount: true,
      created_at: true,
      payment: {
        select: { payment_id: true, pcd_pay_oid: true, created_at: true },
      },
    },
  });
  if (!purchase || !purchase.payment) {
    throw new AppError('환불 대상 결제 정보를 찾을 수 없습니다.', 404, 'NotFound');
  }

  // Payple 결제 취소 호출 (실패 시 DB는 손대지 않음)
  const paypleResult = await requestPaypleRefund({
    payOid: purchase.payment.pcd_pay_oid,
    payDate: formatYyyymmdd(purchase.payment.created_at),
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
        payment_id: purchase.payment!.payment_id,
        user_id: purchase.user_id,
        amount: purchase.amount,
        initiator: 'USER',
        reason: '7일 이내 미열람 자동 환불',
        payple_pay_code: paypleResult.payCode,
        payple_card_trade_num: paypleResult.cardTradeNum ?? null,
      },
    });

    await tx.payment.update({
      where: { payment_id: purchase.payment!.payment_id },
      data: { status: 'Refunded' },
    });

    // Settlement이 있는 경우만 (status 무관하게) Refunded로 전이
    await tx.settlement.updateMany({
      where: { payment_id: purchase.payment!.payment_id },
      data: { status: 'Refunded' },
    });

    return created;
  });

  return {
    message: '환불이 완료되었습니다.',
    refund_id: refund.refund_id,
    refunded_amount: refund.amount,
    refunded_at: refund.refunded_at.toISOString(),
    statusCode: 200,
  };
};

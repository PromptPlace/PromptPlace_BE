import prisma from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { requestPaypleRefund } from '../../settlements/utils/payple-refund';
import {
  AdminRefundActionResultDto,
  AdminRefundDetailResponseDto,
  AdminRefundListResponseDto,
} from '../dtos/refund.dto';
import { formatYyyymmdd, markPaymentRefunded } from './refund.service';
import { RefundStatusValue } from '../utils/refund-policy';

const MAX_PAGE_SIZE = 100;
const MAX_REJECT_REASON = 500;

const listSelect = {
  refund_id: true,
  purchase_id: true,
  status: true,
  amount: true,
  request_reason: true,
  reject_reason: true,
  payple_fail_code: true,
  requested_at: true,
  reviewed_at: true,
  reviewed_by: true,
  user: { select: { user_id: true, nickname: true, email: true } },
  purchase: {
    select: {
      created_at: true,
      downloaded_at: true,
      prompt: { select: { prompt_id: true, title: true } },
    },
  },
} as const;

const toListItem = (r: any) => ({
  refund_id: r.refund_id,
  purchase_id: r.purchase_id,
  status: r.status,
  amount: r.amount,
  request_reason: r.request_reason,
  reject_reason: r.reject_reason,
  payple_fail_code: r.payple_fail_code,
  requested_at: r.requested_at.toISOString(),
  reviewed_at: r.reviewed_at?.toISOString() ?? null,
  reviewed_by: r.reviewed_by,
  buyer: {
    user_id: r.user.user_id,
    nickname: r.user.nickname,
    email: r.user.email,
  },
  prompt: {
    prompt_id: r.purchase.prompt.prompt_id,
    title: r.purchase.prompt.title,
  },
});

export const listRefunds = async (params: {
  status?: RefundStatusValue;
  page: number;
  size: number;
}): Promise<AdminRefundListResponseDto> => {
  const size = Math.min(Math.max(params.size, 1), MAX_PAGE_SIZE);
  const page = Math.max(params.page, 1);
  const where = params.status ? { status: params.status } : {};

  const [rows, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      select: listSelect,
      orderBy: { requested_at: 'desc' },
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.refund.count({ where }),
  ]);

  return {
    message: '환불 목록 조회 성공',
    refunds: rows.map(toListItem),
    total,
    page,
    size,
    statusCode: 200,
  };
};

export const getRefundDetail = async (
  refundId: number,
): Promise<AdminRefundDetailResponseDto> => {
  const refund = await prisma.refund.findUnique({
    where: { refund_id: refundId },
    select: {
      ...listSelect,
      purchase: {
        select: {
          created_at: true,
          downloaded_at: true,
          prompt: {
            select: {
              prompt_id: true,
              title: true,
              description: true,
              prompt: true,
              models: { include: { model: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  if (!refund) {
    throw new AppError('환불 건을 찾을 수 없습니다.', 404, 'NotFound');
  }

  return {
    message: '환불 상세 조회 성공',
    refund: {
      ...toListItem(refund),
      purchased_at: refund.purchase.created_at.toISOString(),
      downloaded_at: refund.purchase.downloaded_at?.toISOString() ?? null,
      // 담당자가 부실 여부를 직접 판단해야 하므로 본문과 상세페이지 설명을 함께 제공한다.
      prompt_detail: {
        description: refund.purchase.prompt.description ?? null,
        prompt: refund.purchase.prompt.prompt ?? null,
        models: refund.purchase.prompt.models.map((m: any) => m.model.name),
      },
    },
    statusCode: 200,
  };
};

// 승인 — 상태를 먼저 APPROVED로 확정한 뒤 Payple 취소를 시도한다.
// 취소가 실패해도 승인을 되돌리지 않는다. 되돌리면 카드사 취소 기간이 지난 건은
// 시스템상 영영 환불 불가로 남기 때문에, APPROVED에서 멈추고 수동 송금 대상으로 넘긴다.
export const approveRefund = async (
  refundId: number,
  adminId: number,
): Promise<AdminRefundActionResultDto> => {
  const refund = await prisma.refund.findUnique({
    where: { refund_id: refundId },
    select: {
      refund_id: true,
      status: true,
      amount: true,
      payment_id: true,
      payment: { select: { pcd_pay_oid: true, created_at: true } },
    },
  });

  if (!refund) throw new AppError('환불 건을 찾을 수 없습니다.', 404, 'NotFound');
  if (refund.status !== 'REQUESTED') {
    throw new AppError(
      `이미 처리된 환불 건입니다. (현재 상태: ${refund.status})`,
      409,
      'RefundAlreadyReviewed',
    );
  }
  if (!refund.payment) {
    throw new AppError('환불 대상 결제 정보를 찾을 수 없습니다.', 404, 'NotFound');
  }

  await prisma.refund.update({
    where: { refund_id: refundId },
    data: { status: 'APPROVED', reviewed_by: adminId, reviewed_at: new Date() },
  });

  try {
    const result = await requestPaypleRefund({
      payOid: refund.payment.pcd_pay_oid,
      payDate: formatYyyymmdd(refund.payment.created_at),
      refundTotal: refund.amount,
    });

    await prisma.$transaction(async (tx) => {
      await tx.refund.update({
        where: { refund_id: refundId },
        data: {
          status: 'COMPLETED',
          refunded_at: new Date(),
          payple_pay_code: result.payCode,
          payple_card_trade_num: result.cardTradeNum ?? null,
          payple_fail_code: null,
        },
      });
      await markPaymentRefunded(tx, refund.payment_id);
    });

    return {
      message: '환불이 승인되어 결제 취소까지 완료되었습니다.',
      refund_id: refundId,
      status: 'COMPLETED',
      statusCode: 200,
    };
  } catch (err: any) {
    const failCode = (err?.paypleCode as string | undefined) ?? 'UNKNOWN';
    console.error('[admin-refund] payple cancel failed after approval', {
      refundId,
      failCode,
    });
    await prisma.refund.update({
      where: { refund_id: refundId },
      data: { payple_fail_code: failCode },
    });

    return {
      message:
        '환불은 승인됐으나 PG 결제 취소에 실패했습니다. 계좌 송금 등으로 수동 처리 후 완료 처리해주세요.',
      refund_id: refundId,
      status: 'APPROVED',
      payple_cancel_failed: true,
      payple_fail_code: failCode,
      statusCode: 200,
    };
  }
};

export const rejectRefund = async (
  refundId: number,
  adminId: number,
  reason: string,
): Promise<AdminRefundActionResultDto> => {
  const trimmed = (reason ?? '').trim();
  if (!trimmed || trimmed.length > MAX_REJECT_REASON) {
    throw new AppError(
      `거절 사유는 1자 이상 ${MAX_REJECT_REASON}자 이하로 입력해주세요.`,
      400,
      'ValidationError',
    );
  }

  const refund = await prisma.refund.findUnique({
    where: { refund_id: refundId },
    select: { status: true },
  });
  if (!refund) throw new AppError('환불 건을 찾을 수 없습니다.', 404, 'NotFound');
  if (refund.status !== 'REQUESTED') {
    throw new AppError(
      `이미 처리된 환불 건입니다. (현재 상태: ${refund.status})`,
      409,
      'RefundAlreadyReviewed',
    );
  }

  await prisma.refund.update({
    where: { refund_id: refundId },
    data: {
      status: 'REJECTED',
      reject_reason: trimmed,
      reviewed_by: adminId,
      reviewed_at: new Date(),
    },
  });

  return {
    message: '환불 신청을 거절했습니다.',
    refund_id: refundId,
    status: 'REJECTED',
    statusCode: 200,
  };
};

// PG 취소가 실패해 APPROVED에서 멈춘 건을 오프라인 송금 후 완료 처리.
export const completeManualRefund = async (
  refundId: number,
  adminId: number,
): Promise<AdminRefundActionResultDto> => {
  const refund = await prisma.refund.findUnique({
    where: { refund_id: refundId },
    select: { status: true, payment_id: true },
  });
  if (!refund) throw new AppError('환불 건을 찾을 수 없습니다.', 404, 'NotFound');
  if (refund.status !== 'APPROVED') {
    throw new AppError(
      `수동 완료 처리는 승인(APPROVED) 상태에서만 가능합니다. (현재 상태: ${refund.status})`,
      409,
      'RefundNotApproved',
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.refund.update({
      where: { refund_id: refundId },
      data: { status: 'COMPLETED', refunded_at: new Date(), reviewed_by: adminId },
    });
    await markPaymentRefunded(tx, refund.payment_id);
  });

  return {
    message: '수동 환불 완료 처리되었습니다.',
    refund_id: refundId,
    status: 'COMPLETED',
    statusCode: 200,
  };
};

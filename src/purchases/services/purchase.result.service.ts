import { AppError } from '../../errors/AppError';
import { PurchaseResultResponseDTO } from '../dtos/purchase.result.dto';
import { PurchaseResultRepository } from '../repositories/purchase.result.repository';

// Payple PCD_PAY_OID: 최대 64자, 영문/숫자와 -, _, .만 허용한다.
const PAYPLE_ORDER_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export const validatePaypleOrderId = (orderId: unknown): orderId is string => (
  typeof orderId === 'string' && PAYPLE_ORDER_ID_PATTERN.test(orderId)
);

export const PurchaseResultService = {
  async getResult(userId: number, orderId: unknown): Promise<PurchaseResultResponseDTO> {
    if (!validatePaypleOrderId(orderId)) {
      throw new AppError('올바른 주문번호가 필요합니다.', 400, 'InvalidOrderId');
    }

    const payment = await PurchaseResultRepository.findByOrderIdAndUser(orderId, userId);
    if (!payment) {
      // 존재 여부와 소유권 오류를 구분하지 않아 다른 사용자의 주문 정보 노출을 막는다.
      throw new AppError('결제 결과를 찾을 수 없습니다.', 404, 'PaymentResultNotFound');
    }

    return {
      message: '결제 결과 조회 성공',
      statusCode: 200,
      order_id: payment.pcd_pay_oid,
      status: payment.status,
      purchase_id: payment.purchase.purchase_id,
      prompt_id: payment.purchase.prompt_id,
      amount: payment.purchase.amount,
      created_at: payment.created_at.toISOString(),
    };
  },
};

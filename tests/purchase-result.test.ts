import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../src/errors/AppError';
import { PurchaseResultRepository } from '../src/purchases/repositories/purchase.result.repository';
import {
  PurchaseResultService,
  validatePaypleOrderId,
} from '../src/purchases/services/purchase.result.service';

test('Payple 주문번호 형식과 최대 길이를 검증한다', () => {
  assert.equal(validatePaypleOrderId('pay-550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(validatePaypleOrderId('order_123.abc'), true);
  assert.equal(validatePaypleOrderId('order/123'), false);
  assert.equal(validatePaypleOrderId(''), false);
  assert.equal(validatePaypleOrderId('a'.repeat(65)), false);
});

test('로그인 사용자의 결제 결과를 프론트 응답으로 변환한다', async () => {
  const originalFind = PurchaseResultRepository.findByOrderIdAndUser;
  const createdAt = new Date('2026-10-02T01:02:03.000Z');

  try {
    (PurchaseResultRepository as any).findByOrderIdAndUser = async (orderId: string, userId: number) => {
      assert.equal(orderId, 'pay-order-123');
      assert.equal(userId, 7);
      return {
        pcd_pay_oid: orderId,
        status: 'Succeed',
        created_at: createdAt,
        purchase: {
          purchase_id: 31,
          prompt_id: 42,
          amount: 12000,
        },
      };
    };

    const result = await PurchaseResultService.getResult(7, 'pay-order-123');

    assert.deepEqual(result, {
      message: '결제 결과 조회 성공',
      statusCode: 200,
      order_id: 'pay-order-123',
      status: 'Succeed',
      purchase_id: 31,
      prompt_id: 42,
      amount: 12000,
      created_at: createdAt.toISOString(),
    });
  } finally {
    PurchaseResultRepository.findByOrderIdAndUser = originalFind;
  }
});

test('없는 주문과 다른 사용자의 주문은 동일한 404 오류로 처리한다', async () => {
  const originalFind = PurchaseResultRepository.findByOrderIdAndUser;

  try {
    (PurchaseResultRepository as any).findByOrderIdAndUser = async () => null;

    await assert.rejects(
      PurchaseResultService.getResult(7, 'pay-order-404'),
      (error: unknown) => (
        error instanceof AppError
        && error.statusCode === 404
        && error.error === 'PaymentResultNotFound'
      ),
    );
  } finally {
    PurchaseResultRepository.findByOrderIdAndUser = originalFind;
  }
});

test('형식이 잘못된 주문번호는 DB 조회 전에 거절한다', async () => {
  const originalFind = PurchaseResultRepository.findByOrderIdAndUser;
  let queried = false;

  try {
    (PurchaseResultRepository as any).findByOrderIdAndUser = async () => {
      queried = true;
      return null;
    };

    await assert.rejects(
      PurchaseResultService.getResult(7, 'invalid/order'),
      (error: unknown) => (
        error instanceof AppError
        && error.statusCode === 400
        && error.error === 'InvalidOrderId'
      ),
    );
    assert.equal(queried, false);
  } finally {
    PurchaseResultRepository.findByOrderIdAndUser = originalFind;
  }
});

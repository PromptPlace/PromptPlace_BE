// 환불 기간 경계 자체 검증. 실행: npx ts-node src/refunds/utils/refund-policy.check.ts
// 정책의 핵심은 "시:분을 무시한 KST 날짜 기준, 첫날 제외"이므로 경계값만 확인한다. (#533)
import assert from 'assert';
import {
  checkAutoRefund,
  checkManualRefund,
  getAutoRefundDeadline,
  getManualRefundDeadline,
  RefundPolicyInput,
} from './refund-policy';

// KST 시각을 UTC Date로
const kst = (iso: string): Date => new Date(`${iso}+09:00`);

const paid = (createdAt: Date, downloadedAt: Date | null = null): RefundPolicyInput => ({
  purchase_user_id: 1,
  created_at: createdAt,
  downloaded_at: downloadedAt,
  is_free: false,
  payment_status: 'Succeed',
  refund_status: null,
});

// --- 자동 환불 마감: 7/23 구매 → 7/30 23:59:59까지 (= 7/31 00:00 KST 직전) ---
{
  const expected = kst('2026-07-31T00:00:00');
  for (const t of ['2026-07-23T00:00:00', '2026-07-23T15:00:00', '2026-07-23T23:59:59']) {
    assert.strictEqual(
      getAutoRefundDeadline(kst(t)).getTime(),
      expected.getTime(),
      `구매 시각 ${t} 의 마감이 7/31 00:00 KST 여야 함 (시간대 무시)`,
    );
  }
}

// --- 경계: 마감 직전은 가능, 마감 시각부터 불가 ---
{
  const purchase = paid(kst('2026-07-23T15:00:00'));
  assert.strictEqual(checkAutoRefund(purchase, 1, kst('2026-07-30T23:59:59')).eligible, true);
  assert.strictEqual(checkAutoRefund(purchase, 1, kst('2026-07-31T00:00:00')).eligible, false);
  assert.strictEqual(
    checkAutoRefund(purchase, 1, kst('2026-07-31T00:00:00')).reason,
    'EXPIRED_7DAYS',
  );
  // 구매 당일도 당연히 가능
  assert.strictEqual(checkAutoRefund(purchase, 1, kst('2026-07-23T15:00:01')).eligible, true);
}

// --- 열람하면 자동 환불 불가, 대신 수동 환불 대상 ---
{
  const opened = paid(kst('2026-07-23T15:00:00'), kst('2026-07-24T10:00:00'));
  const now = kst('2026-07-25T00:00:00');
  assert.strictEqual(checkAutoRefund(opened, 1, now).reason, 'ALREADY_DOWNLOADED');
  assert.strictEqual(checkManualRefund(opened, 1, now).eligible, true);
}

// --- 미열람 건은 수동 환불 신청 대상이 아님 (자동 환불로 안내) ---
{
  const unopened = paid(kst('2026-07-23T15:00:00'));
  assert.strictEqual(
    checkManualRefund(unopened, 1, kst('2026-07-25T00:00:00')).reason,
    'NOT_DOWNLOADED',
  );
}

// --- 수동 환불 3개월 마감 + 말일 보정 (1/31 + 3개월 → 4/30) ---
{
  assert.strictEqual(
    getManualRefundDeadline(kst('2026-01-31T12:00:00')).getTime(),
    kst('2026-05-01T00:00:00').getTime(),
    '1/31 구매의 3개월 마감은 4/30 종료여야 함',
  );
  const opened = paid(kst('2026-07-23T15:00:00'), kst('2026-07-24T10:00:00'));
  assert.strictEqual(checkManualRefund(opened, 1, kst('2026-10-23T23:59:59')).eligible, true);
  assert.strictEqual(
    checkManualRefund(opened, 1, kst('2026-10-24T00:00:00')).reason,
    'EXPIRED_3MONTHS',
  );
}

// --- 공통 전제: 소유권 / 무료 / 결제상태 / 기존 환불 이력 ---
{
  const now = kst('2026-07-24T00:00:00');
  const base = paid(kst('2026-07-23T15:00:00'));
  assert.strictEqual(checkAutoRefund(base, 999, now).reason, 'NOT_OWNER');
  assert.strictEqual(checkAutoRefund({ ...base, is_free: true }, 1, now).reason, 'FREE_PURCHASE');
  assert.strictEqual(
    checkAutoRefund({ ...base, payment_status: 'Pending' }, 1, now).reason,
    'PAYMENT_NOT_SUCCEEDED',
  );
  assert.strictEqual(
    checkAutoRefund({ ...base, refund_status: 'COMPLETED' }, 1, now).reason,
    'ALREADY_REFUNDED',
  );
  assert.strictEqual(
    checkAutoRefund({ ...base, refund_status: 'REQUESTED' }, 1, now).reason,
    'REFUND_IN_REVIEW',
  );
  assert.strictEqual(
    checkAutoRefund({ ...base, refund_status: 'REJECTED' }, 1, now).reason,
    'REFUND_REJECTED',
  );
  // 소유권 위반은 다른 사유보다 먼저 걸러져야 함 (정보 노출 방지)
  assert.strictEqual(checkAutoRefund({ ...base, is_free: true }, 999, now).reason, 'NOT_OWNER');
}

console.log('refund-policy: 모든 경계 검증 통과');

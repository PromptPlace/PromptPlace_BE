// 환불 정책 판정 — 단건 조회 / 목록 / 수동 신청이 공유하는 단일 소스.
// 정책이 여러 곳에 복제되면 한쪽만 고쳐져 목록의 버튼 상태와 실제 환불 결과가 어긋나므로,
// 판정은 전부 이 파일의 순수 함수를 거친다. (#533)
//
// - 자동 환불: 열람 전 + 구매 후 7일 이내
// - 수동 환불: 열람 후 + 구매 후 3개월 이내 (담당자 검토)
//
// 7일 기준은 시:분을 무시한 KST 날짜 기준이며 첫날을 제외한다.
// 예) 7/23 어느 시각에 구매하든 7/30 23:59:59(KST)까지 신청 가능.

export type RefundStatusValue = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type RefundIneligibleReason =
  | 'EXPIRED_7DAYS'
  | 'EXPIRED_3MONTHS'
  | 'ALREADY_DOWNLOADED'
  | 'NOT_DOWNLOADED'
  | 'ALREADY_REFUNDED'
  | 'REFUND_IN_REVIEW'
  | 'REFUND_REJECTED'
  | 'NOT_OWNER'
  | 'NOT_PURCHASED'
  | 'PAYMENT_NOT_SUCCEEDED'
  | 'FREE_PURCHASE';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const AUTO_REFUND_DAYS = 7;
export const MANUAL_REFUND_MONTHS = 3;

// 환불이 확정된 상태 — 콘텐츠 재열람을 막고 "환불됨"으로 표시해야 하는 구간.
// APPROVED는 담당자 승인이 끝나 금액이 돌아가는 중(Payple 취소 실패 시 수동 송금 대기)이므로
// COMPLETED와 동일하게 취급한다. REQUESTED는 아직 검토 중이라 접근을 막지 않는다.
export const isRefundSettled = (status?: string | null): boolean =>
  status === 'APPROVED' || status === 'COMPLETED';

// 해당 시각이 속한 KST 날짜의 일련번호 (1970-01-01 KST = 0)
const kstDayIndex = (t: Date): number => Math.floor((t.getTime() + KST_OFFSET_MS) / DAY_MS);

// KST 날짜 일련번호의 종료 시각 = 다음 날 00:00 KST (경계는 미포함)
const endOfKstDay = (dayIndex: number): Date =>
  new Date((dayIndex + 1) * DAY_MS - KST_OFFSET_MS);

// 자동 환불 마감 — 구매일 다음 날부터 7일째 되는 날의 끝 (첫날 제외).
export const getAutoRefundDeadline = (purchasedAt: Date): Date =>
  endOfKstDay(kstDayIndex(purchasedAt) + AUTO_REFUND_DAYS);

// 수동 환불 마감 — 구매일로부터 3개월 후 같은 날짜의 끝 (KST).
// 말일 보정: 1/31 + 3개월은 4/31이 없으므로 4/30으로 당긴다.
export const getManualRefundDeadline = (purchasedAt: Date): Date => {
  const kst = new Date(purchasedAt.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth();
  const date = kst.getUTCDate();

  // Date.UTC(y, m+4, 0) => (m+3)월의 말일
  const lastDateOfTargetMonth = new Date(
    Date.UTC(year, month + MANUAL_REFUND_MONTHS + 1, 0),
  ).getUTCDate();
  const targetDate = Math.min(date, lastDateOfTargetMonth);

  return new Date(Date.UTC(year, month + MANUAL_REFUND_MONTHS, targetDate + 1) - KST_OFFSET_MS);
};

export interface RefundPolicyInput {
  purchase_user_id: number;
  created_at: Date;
  downloaded_at: Date | null;
  is_free: boolean;
  payment_status: string | null | undefined;
  refund_status: RefundStatusValue | null;
}

// Prisma로 조회한 Purchase 행을 판정 입력으로 옮긴다.
// 정책을 쓰는 쪽(환불 API / 다운로드 목록)이 모두 같은 형태로 넘기도록 여기에 둔다.
export interface PurchaseWithPolicyFields {
  user_id: number;
  created_at: Date;
  downloaded_at: Date | null;
  is_free: boolean;
  payment?: { status: string } | null;
  refund?: { status: string } | null;
}

export const toPolicyInput = (purchase: PurchaseWithPolicyFields): RefundPolicyInput => ({
  purchase_user_id: purchase.user_id,
  created_at: purchase.created_at,
  downloaded_at: purchase.downloaded_at,
  is_free: purchase.is_free,
  payment_status: purchase.payment?.status,
  refund_status: (purchase.refund?.status as RefundStatusValue) ?? null,
});

export interface RefundVerdict {
  eligible: boolean;
  reason?: RefundIneligibleReason;
  refund_deadline: string | null;
  remaining_seconds?: number;
}

// 자동/수동 공통 전제 — 소유권, 유료 여부, 결제 성공, 기존 환불 이력.
const checkCommon = (
  input: RefundPolicyInput,
  requesterId: number,
): RefundIneligibleReason | null => {
  if (input.purchase_user_id !== requesterId) return 'NOT_OWNER';
  if (input.is_free) return 'FREE_PURCHASE';
  if (input.payment_status !== 'Succeed') return 'PAYMENT_NOT_SUCCEEDED';

  switch (input.refund_status) {
    case 'REQUESTED':
      return 'REFUND_IN_REVIEW';
    case 'REJECTED':
      return 'REFUND_REJECTED';
    case 'APPROVED':
    case 'COMPLETED':
      return 'ALREADY_REFUNDED';
    default:
      return null;
  }
};

const verdict = (
  reason: RefundIneligibleReason | null,
  deadline: Date,
  now: Date,
): RefundVerdict => {
  if (reason) return { eligible: false, reason, refund_deadline: deadline.toISOString() };
  return {
    eligible: true,
    refund_deadline: deadline.toISOString(),
    remaining_seconds: Math.floor((deadline.getTime() - now.getTime()) / 1000),
  };
};

// 열람 전 7일 이내 자동 환불 가능 여부.
export const checkAutoRefund = (
  input: RefundPolicyInput,
  requesterId: number,
  now: Date = new Date(),
): RefundVerdict => {
  const deadline = getAutoRefundDeadline(input.created_at);
  const common = checkCommon(input, requesterId);
  if (common) return verdict(common, deadline, now);
  if (input.downloaded_at) return verdict('ALREADY_DOWNLOADED', deadline, now);
  if (now.getTime() >= deadline.getTime()) return verdict('EXPIRED_7DAYS', deadline, now);
  return verdict(null, deadline, now);
};

// 열람 후 3개월 이내 수동 환불 신청 가능 여부.
export const checkManualRefund = (
  input: RefundPolicyInput,
  requesterId: number,
  now: Date = new Date(),
): RefundVerdict => {
  const deadline = getManualRefundDeadline(input.created_at);
  const common = checkCommon(input, requesterId);
  if (common) return verdict(common, deadline, now);
  // 미열람 건은 수동 검토 대상이 아니라 자동 환불 대상.
  if (!input.downloaded_at) return verdict('NOT_DOWNLOADED', deadline, now);
  if (now.getTime() >= deadline.getTime()) return verdict('EXPIRED_3MONTHS', deadline, now);
  return verdict(null, deadline, now);
};

// 판정 사유는 정책 함수(refund-policy)가 단일 소스이므로 여기서는 재노출만 한다. (#533)
export type { RefundIneligibleReason } from '../utils/refund-policy';
import type { RefundIneligibleReason } from '../utils/refund-policy';

export interface RefundEligibilityResponseDto {
  message: string;
  eligible: boolean; // 열람 전 7일 이내 자동 환불 가능 여부
  reason?: RefundIneligibleReason;
  remaining_seconds?: number; // 자동 환불 잔여 시간 (eligible=true일 때만)
  refund_deadline: string | null; // 자동 환불 마감 시각 (KST 기준 D+7 종료)
  manual_refund_available: boolean; // 열람 후 수동 환불 신청 가능 여부
  manual_refund_deadline: string | null; // 수동 환불 신청 마감 (구매 후 3개월)
  statusCode: number;
}

export interface RefundResultDto {
  message: string;
  refund_id: number;
  refunded_amount: number;
  refunded_at: string;
  statusCode: number;
}

export interface RefundRequestResultDto {
  message: string;
  refund_id: number;
  status: 'REQUESTED';
  requested_at: string;
  statusCode: number;
}

// --- 관리자 ---

export interface AdminRefundListItemDto {
  refund_id: number;
  purchase_id: number;
  status: string;
  amount: number;
  request_reason: string | null;
  reject_reason: string | null;
  payple_fail_code: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  buyer: { user_id: number; nickname: string; email: string };
  prompt: { prompt_id: number; title: string };
}

export interface AdminRefundListResponseDto {
  message: string;
  refunds: AdminRefundListItemDto[];
  total: number;
  page: number;
  size: number;
  statusCode: number;
}

// 담당자가 "본문이 부실한지 / 외부에서 가져온 것인지"를 판단해야 하므로
// 상세 응답에 프롬프트 본문과 상세페이지 설명을 함께 싣는다.
export interface AdminRefundDetailDto extends AdminRefundListItemDto {
  purchased_at: string;
  downloaded_at: string | null;
  prompt_detail: {
    description: string | null;
    prompt: string | null;
    models: string[];
  };
}

export interface AdminRefundDetailResponseDto {
  message: string;
  refund: AdminRefundDetailDto;
  statusCode: number;
}

export interface AdminRefundActionResultDto {
  message: string;
  refund_id: number;
  status: string;
  payple_cancel_failed?: boolean; // 승인됐으나 Payple 취소가 실패 → 수동 송금 필요
  payple_fail_code?: string | null;
  statusCode: number;
}

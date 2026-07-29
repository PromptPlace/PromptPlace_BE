export interface PromptDownloadResponseDTO {
  message: string;
  title: string;
  prompt: string;
  is_free: boolean;
  is_paid: boolean;
  statusCode: number;
}

export interface DownloadedPromptResponseDTO {
  message: string;
  prompt_id: number;
  purchase_id: number;
  is_refunded: boolean; // 환불 확정(APPROVED/COMPLETED) 여부
  refund_status: string | null; // REQUESTED | APPROVED | REJECTED | COMPLETED (#533)
  refundable: boolean; // 열람 전 + 7일 이내 → 즉시 환불 버튼 활성화 (#533)
  refund_deadline: string | null; // 자동 환불 마감 시각 (#533)
  manual_refund_available: boolean; // 열람 후 + 3개월 이내 → 환불 신청 버튼 활성화 (#533)
  title: string;
  description: string;
  models: string[];
  imageUrls: string[];
  price: number;
  has_review: boolean;
  is_recent_review: boolean;
  userNickname: string;
  userProfileImageUrl: string | null;
  userReview: {
        review_id: number;
        content: string;
        rating: number;
    } | null;
  statusCode: number;
}
export interface PromptPurchaseCompleteRequestDTO {
  imp_uid: string;        // 포트원 결제 UID
  merchant_uid: string;   // 주문번호
}

export interface PromptPurchaseCompleteResponseDTO {
  message: string;
  status: 'Succeed' | 'Failed' | 'Pending';
  purchase_id?: number;
  statusCode: number;
}
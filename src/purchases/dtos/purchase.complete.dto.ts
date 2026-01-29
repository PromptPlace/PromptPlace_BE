export interface PromptPurchaseCompleteRequestDTO {
  paymentId: string;
}

export interface PromptPurchaseCompleteResponseDTO {
  message: string;
  status: 'Succeed' | 'Failed' | 'Pending';
  purchase_id?: number;
  statusCode: number;
}
export interface PurchaseCompleteRequestDTO {
  paymentId: string;
}

export interface PurchaseCompleteResponseDTO {
  message: string;
  status: 'Succeed' | 'Failed' | 'Pending';
  purchase_id?: number;
  statusCode: number;
}
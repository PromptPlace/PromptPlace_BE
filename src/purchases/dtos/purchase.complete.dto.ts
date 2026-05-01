import { PayplePaymentResult } from '../utils/payple';

export type PurchaseCompleteRequestDTO = PayplePaymentResult;

export interface PurchaseCompleteResponseDTO {
  message: string;
  status: 'Succeed' | 'Failed' | 'Pending';
  purchase_id?: number;
  statusCode: number;
}

export interface PurchaseRequestDTO {
  prompt_id: number;
}

export interface PurchaseRequestResponseDTO {
  message: string;
  statusCode: number;
  storeId: string;
  paymentId: string;    
  orderName: string;   
  totalAmount: number; 
  channelKey: string;
  customData: {
    prompt_id: number;
    user_id: number;
  };
}
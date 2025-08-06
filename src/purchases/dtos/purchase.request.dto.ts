export interface PaymentBuyer {
  name: string;
  email: string;
  tel: string;
}

export interface ProductItem {
  categoryType: string;
  categoryId: string;
  uid: string;
  name: string;
  count: number;
  sellerId: string;
}

export interface CustomData {
   user_id: number;
}

export interface PromptPurchaseRequestDTO {
  prompt_id: number;
  pg: 'kakaopay' | 'tosspayments';
  merchant_uid: string;
  amount: number;
  buyer: PaymentBuyer;
  redirect_url: string;
  products: ProductItem[];
  custom_data: CustomData;
}

export interface PromptPurchaseResponseDTO {
  message: string;
  payment_gateway: string;
  merchant_uid: string;
  redirect_url: string;
  statusCode: number;
}
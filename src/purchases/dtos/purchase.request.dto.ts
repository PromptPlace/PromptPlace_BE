export interface PromptPurchaseRequestDTO {
  prompt_id: number;
  pg: 'kakaopay' | 'tosspay';  // 결제 수단
  merchant_uid: string;             // 고유 주문번호
  amount: number;
  buyer_name: string;
  redirect_url: string;
}
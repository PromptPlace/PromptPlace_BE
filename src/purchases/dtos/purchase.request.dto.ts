export type PaypleClientPayType = 'card' | 'transfer';

export interface PurchaseRequestDTO {
  prompt_id: number;
  pay_type?: PaypleClientPayType;
}

export interface PurchaseRequestResponseDTO {
  message: string;
  statusCode: number;
  PCD_CST_ID: string;
  PCD_CUST_KEY: string;
  PCD_AUTH_KEY: string;
  PCD_PAY_TYPE: PaypleClientPayType;
  PCD_PAY_WORK: 'PAY';
  PCD_PAY_HOST: string;
  PCD_PAY_URL: string;
  PCD_PAY_OID: string;
  PCD_PAY_GOODS: string;
  PCD_PAY_TOTAL: number;
  PCD_USER_DEFINE1: string;
}

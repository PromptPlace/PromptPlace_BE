import { PaymentProvider } from "@prisma/client";

export interface PurchaseHistoryItemDTO {
    prompt_id: number;
    title: string;
    price: number;
    seller_nickname: string;
    pg: PaymentProvider | null;
}

export interface PurchaseHistoryResponseDTO {
    message: string;
    purchases: PurchaseHistoryItemDTO[];
    statusCode: number;
}
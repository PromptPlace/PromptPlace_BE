
export interface PurchaseHistoryItemDTO {
    prompt_id: number;
    title: string;
    price: number;
    seller_nickname: string;
}

export interface PurchaseHistoryResponseDTO {
    message: string;
    purchases: PurchaseHistoryItemDTO[];
    statusCode: number;
}
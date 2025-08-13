export interface PurchaseHistoryItemDTO {
    prompt_id: number;
    title: string;
    price: number;
    seller_nickname: string;
    pg: 'kakaopay' | 'tosspay';
}

export interface PurchaseHistoryResponseDTO {
    message: string;
    purchases: PurchaseHistoryItemDTO[];
    statusCode: number;
}
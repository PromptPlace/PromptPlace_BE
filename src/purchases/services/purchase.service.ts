import { PurchaseRepository } from "../repositories/purchase.repository";
import { PurchaseHistoryItemDTO, PurchaseHistoryResponseDTO } from "../dtos/purchase.dto";

export const PurchaseHistoryService = {
    async list(userId: number): Promise<PurchaseHistoryResponseDTO> {
        const rows = await PurchaseRepository.findSucceededByUser(userId);
    
        const purchases: PurchaseHistoryItemDTO[] = rows.map((r) => ({
            prompt_id: r.prompt.prompt_id,
            title: r.prompt.title,
            price:  r.amount,
            purchased_at: r.created_at.toISOString(),
            seller_nickname: r.prompt.user.nickname,
            pg: r.payment?.provider ?? null,
        }));

        return {
            message: "결제 내역 조회 성공",
            purchases,
            statusCode: 200,
        }
    }
}
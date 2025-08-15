import { PurchaseRepository } from "../repositories/purchase.request.repository";
import { PurchaseHistoryItemDTO, PurchaseHistoryResponseDTO } from "../dtos/purchase.dto";

function mapPgProvider(pg: string | undefined): 'kakaopay' | 'tosspay' {
  const src = (pg || '').toLowerCase();
  if (src.includes('kakaopay')) return 'kakaopay';
  if (src.includes('tosspay')) return 'tosspay';
  return 'tosspay';
}

export const PurchaseHistoryService = {
    async list(userId: number): Promise<PurchaseHistoryResponseDTO> {
        const rows = await PurchaseRepository.findSucceededByUser(userId);
    
        const purchases: PurchaseHistoryItemDTO[] = rows.map((r) => ({
            prompt_id: r.prompt.prompt_id,
            title: r.prompt.title,
            price:  r.amount,
            purchased_at: r.created_at.toISOString(),
            seller_nickname: r.prompt.user.nickname,
            pg: mapPgProvider(r.payment?.provider),
        }));

        return {
            message: "결제 내역 조회 성공",
            purchases,
            statusCode: 200,
        }
    }
}
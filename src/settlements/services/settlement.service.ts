import { SettlementRepository } from "../repositories/settlement.repository";
import { SaleHistoryResponseDto } from "../dtos/settlement.dto";

export const SettlementService = {
  async getSalesByUserId(userId: number): Promise<SaleHistoryResponseDto> {
    const settlements = await SettlementRepository.findSalesByUserId(userId);

    const sales = settlements.map((settlement) => {
      const purchase = settlement.payment.purchase;
      const prompt = purchase.prompt;
      const buyer = purchase.user;

      return {
        prompt_id: prompt.prompt_id,
        title: prompt.title,
        price: purchase.amount,
        sold_at: purchase.created_at.toISOString(),
        buyer_nickname: buyer.nickname,
      };
    });

    return {
      message: '판매 내역 조회 성공',
      sales,
      statusCode: 200,
    };
  }
};
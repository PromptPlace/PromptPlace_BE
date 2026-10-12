import prisma from '../../config/prisma';

export const PurchaseMailRepository = {
  /**
   * 결제 완료 메일에 필요한 정보를 한 번에 조회한다.
   * 구매자 이메일, 프롬프트(이름·가격·판매자), 결제(주문번호·수단·일시)
   */
  findPurchaseForMail(purchaseId: number) {
    return prisma.purchase.findUnique({
      where: { purchase_id: purchaseId },
      select: {
        purchase_id: true,
        amount: true,
        is_free: true,
        created_at: true,
        user: {
          select: { email: true, nickname: true, name: true },
        },
        prompt: {
          select: {
            prompt_id: true,
            title: true,
            price: true,
            user: { select: { nickname: true } }, // 판매자
          },
        },
        payment: {
          select: {
            pcd_pay_oid: true, // 주문번호 (결과 조회 API의 order_id와 동일)
            status: true,
            pay_type: true,
            card_name: true,
            created_at: true,
          },
        },
      },
    });
  },
};

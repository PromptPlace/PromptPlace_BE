import eventBus from '../../config/eventBus';
import { sendMail } from '../../utils/mailer';
import { PurchaseMailRepository } from '../repositories/purchase.mail.repository';
import { buildPurchaseCompleteMail, toPayMethodLabel } from '../utils/purchase-mail.template';

export const PURCHASE_COMPLETED = 'purchase.completed';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://promptplace-develop.vercel.app').replace(/\/$/, '');
const ORDER_HISTORY_PATH = process.env.ORDER_HISTORY_PATH || '/mypage/purchases';

export const sendPurchaseCompleteMail = async (purchaseId: number) => {
  const purchase = await PurchaseMailRepository.findPurchaseForMail(purchaseId);

  if (!purchase || purchase.is_free || purchase.payment?.status !== 'Succeed') {
    console.warn(`[결제메일] purchase_id=${purchaseId} 유료 결제 완료 건이 아니므로 발송하지 않음`);
    return;
  }
  if (!purchase.user.email) {
    console.warn(`[결제메일] purchase_id=${purchaseId} 구매자 이메일 없음`);
    return;
  }

  const { subject, html, text } = buildPurchaseCompleteMail({
    buyerName: purchase.user.nickname || purchase.user.name,
    orderId: purchase.payment.pcd_pay_oid,
    paidAt: purchase.payment.created_at,
    promptTitle: purchase.prompt.title,
    promptPrice: purchase.prompt.price,
    sellerName: purchase.prompt.user.nickname,
    amount: purchase.amount,
    payMethod: toPayMethodLabel(purchase.payment.pay_type, purchase.payment.card_name),
    orderHistoryUrl: `${FRONTEND_URL}${ORDER_HISTORY_PATH}`,
  });

  await sendMail({ to: purchase.user.email, subject, html, text });
  console.log(`[결제메일] 발송 완료 purchase_id=${purchaseId} order_id=${purchase.payment.pcd_pay_oid}`);
};

// 결제 완료 메일 리스너 — 실패해도 결제 응답에는 영향을 주지 않는다
eventBus.on(PURCHASE_COMPLETED, async (purchaseId: number) => {
  try {
    await sendPurchaseCompleteMail(purchaseId);
  } catch (err) {
    console.error(`[결제메일 리스너 오류]: purchase_id=${purchaseId} 발송 실패`, err);
  }
});

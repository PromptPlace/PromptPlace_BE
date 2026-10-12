/**
 * 결제 완료 메일 수동 발송 (dev 테스트용)
 * 실제 결제 없이, DB에 이미 있는 유료 결제 건(purchase_id)으로 메일을 보내본다.
 *
 * 사용법:
 *   npx dotenv -e .env.dev -- ts-node src/scripts/send-purchase-mail.ts <purchase_id>
 */
import prisma from '../config/prisma';
import { sendPurchaseCompleteMail } from '../purchases/listeners/purchase.mail.listener';

const main = async () => {
  const purchaseId = Number(process.argv[2]);
  if (!Number.isSafeInteger(purchaseId) || purchaseId <= 0) {
    console.error('사용법: ts-node src/scripts/send-purchase-mail.ts <purchase_id>');
    process.exitCode = 1;
    return;
  }
  await sendPurchaseCompleteMail(purchaseId);
};

main()
  .catch((err) => {
    console.error('[send-purchase-mail] 실패:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

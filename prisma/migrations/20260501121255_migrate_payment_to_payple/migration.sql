-- Migrate Payment model from PortOne (merchant_uid/imp_uid) to Payple (pcd_pay_oid/pcd_pay_reqkey)
-- Note: existing Payment rows are PortOne test data only (no real transactions yet).

-- DropIndex
DROP INDEX `Payment_merchant_uid_key` ON `Payment`;
DROP INDEX `Payment_imp_uid_key` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment`
  DROP COLUMN `merchant_uid`,
  DROP COLUMN `imp_uid`,
  DROP COLUMN `cash_receipt_type`,
  ADD COLUMN `pcd_pay_oid` VARCHAR(191) NOT NULL,
  ADD COLUMN `pcd_pay_reqkey` VARCHAR(191) NOT NULL,
  ADD COLUMN `pay_type` VARCHAR(191) NULL,
  ADD COLUMN `card_name` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_pcd_pay_oid_key` ON `Payment`(`pcd_pay_oid`);
CREATE UNIQUE INDEX `Payment_pcd_pay_reqkey_key` ON `Payment`(`pcd_pay_reqkey`);

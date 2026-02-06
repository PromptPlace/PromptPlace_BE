/*
  Warnings:

  - The values [kakaopay,tosspay] on the enum `Payment_provider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `cash_receipt_type` VARCHAR(191) NULL,
    ADD COLUMN `cash_receipt_url` VARCHAR(191) NULL,
    ADD COLUMN `method` ENUM('CARD', 'VIRTUAL_ACCOUNT', 'TRANSFER', 'MOBILE', 'EASY_PAY') NOT NULL DEFAULT 'CARD',
    MODIFY `provider` ENUM('TOSSPAYMENTS', 'KAKAOPAY', 'NAVERPAY', 'TOSSPAY', 'SAMSUNGPAY', 'APPLEPAY', 'LPAY', 'PAYCO', 'SSG', 'PINPAY') NOT NULL;

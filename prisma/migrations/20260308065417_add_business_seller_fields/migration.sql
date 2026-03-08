/*
  Warnings:

  - A unique constraint covering the columns `[business_number]` on the table `SettlementAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `SettlementAccount` ADD COLUMN `business_license_url` TEXT NULL,
    ADD COLUMN `business_number` VARCHAR(30) NULL,
    ADD COLUMN `company_name` VARCHAR(100) NULL,
    ADD COLUMN `representative_name` VARCHAR(100) NULL,
    ADD COLUMN `seller_type` ENUM('INDIVIDUAL', 'BUSINESS') NOT NULL DEFAULT 'INDIVIDUAL',
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE UNIQUE INDEX `SettlementAccount_business_number_key` ON `SettlementAccount`(`business_number`);

-- CreateIndex
CREATE INDEX `SettlementAccount_status_idx` ON `SettlementAccount`(`status`);

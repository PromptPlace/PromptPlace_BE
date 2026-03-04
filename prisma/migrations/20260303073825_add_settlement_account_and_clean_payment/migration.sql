/*
  Warnings:

  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `Bank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PreRegisteredAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserBankAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PreRegisteredAccount` DROP FOREIGN KEY `PreRegisteredAccount_bank_code_fkey`;

-- DropForeignKey
ALTER TABLE `PreRegisteredAccount` DROP FOREIGN KEY `PreRegisteredAccount_owner_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserBankAccount` DROP FOREIGN KEY `UserBankAccount_preregistered_id_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserBankAccount` DROP FOREIGN KEY `UserBankAccount_user_id_fkey`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `method`,
    DROP COLUMN `provider`;

-- DropTable
DROP TABLE `Bank`;

-- DropTable
DROP TABLE `PreRegisteredAccount`;

-- DropTable
DROP TABLE `UserBankAccount`;

-- CreateTable
CREATE TABLE `SettlementAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `bank_code` VARCHAR(50) NOT NULL,
    `account_number` VARCHAR(30) NOT NULL,
    `account_holder` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SettlementAccount_user_id_key`(`user_id`),
    INDEX `SettlementAccount_bank_code_idx`(`bank_code`),
    INDEX `SettlementAccount_account_number_idx`(`account_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SettlementAccount` ADD CONSTRAINT `SettlementAccount_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

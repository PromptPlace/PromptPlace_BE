/*
  Warnings:

  - You are about to drop the column `category_id` on the `PromptReport` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `PromptReport` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `PromptReport` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `PromptReport` table. All the data in the column will be lost.
  - You are about to drop the `ReportCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReportCategoryDetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `PromptReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_type` to the `PromptReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporter_id` to the `PromptReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PromptReport` DROP FOREIGN KEY `PromptReport_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptReport` DROP FOREIGN KEY `PromptReport_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `ReportCategoryDetail` DROP FOREIGN KEY `ReportCategoryDetail_category_id_fkey`;

-- DropIndex
DROP INDEX `PromptReport_category_id_fkey` ON `PromptReport`;

-- DropIndex
DROP INDEX `PromptReport_user_id_fkey` ON `PromptReport`;

-- AlterTable
ALTER TABLE `PromptReport` DROP COLUMN `category_id`,
    DROP COLUMN `content`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `report_type` ENUM('FALSE_OR_EXAGGERATED', 'COPYRIGHT_INFRINGEMENT', 'INAPPROPRIATE_OR_HARMFUL', 'ETC') NOT NULL,
    ADD COLUMN `reporter_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `ReportCategory`;

-- DropTable
DROP TABLE `ReportCategoryDetail`;

-- AddForeignKey
ALTER TABLE `PromptReport` ADD CONSTRAINT `PromptReport_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

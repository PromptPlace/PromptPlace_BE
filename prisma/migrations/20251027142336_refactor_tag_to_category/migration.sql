/*
  Warnings:

  - You are about to drop the `PromptTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PromptTag` DROP FOREIGN KEY `PromptTag_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptTag` DROP FOREIGN KEY `PromptTag_tag_id_fkey`;

-- DropTable
DROP TABLE `PromptTag`;

-- DropTable
DROP TABLE `Tag`;

-- CreateTable
CREATE TABLE `PromptCategory` (
    `promptcategory_id` INTEGER NOT NULL AUTO_INCREMENT,
    `prompt_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    INDEX `PromptTag_prompt_id_fkey`(`prompt_id`),
    INDEX `PromptTag_tag_id_fkey`(`category_id`),
    PRIMARY KEY (`promptcategory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PromptCategory` ADD CONSTRAINT `PromptCategory_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptCategory` ADD CONSTRAINT `PromptCategory_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

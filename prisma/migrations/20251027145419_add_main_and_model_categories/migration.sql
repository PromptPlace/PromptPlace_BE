/*
  Warnings:

  - Added the required column `main_category_id` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model_category_id` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE `ModelCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `ModelCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MainCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `MainCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO `ModelCategory` (`name`) VALUES ('일반');
INSERT INTO `MainCategory` (`name`) VALUES ('일반');

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `main_category_id` INTEGER;
UPDATE `Category` SET `main_category_id` = (SELECT id FROM `MainCategory` WHERE `name` = '일반') WHERE `main_category_id` IS NULL;
ALTER TABLE `Category` MODIFY COLUMN `main_category_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Model` ADD COLUMN `model_category_id` INTEGER;
UPDATE `Model` SET `model_category_id` = (SELECT id FROM `ModelCategory` WHERE `name` = '일반') WHERE `model_category_id` IS NULL;
ALTER TABLE `Model` MODIFY COLUMN `model_category_id` INTEGER NOT NULL;


-- CreateIndex
CREATE INDEX `Category_main_category_id_idx` ON `Category`(`main_category_id`);

-- CreateIndex
CREATE INDEX `Model_model_category_id_idx` ON `Model`(`model_category_id`);

-- AddForeignKey
ALTER TABLE `Model` ADD CONSTRAINT `Model_model_category_id_fkey` FOREIGN KEY (`model_category_id`) REFERENCES `ModelCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_main_category_id_fkey` FOREIGN KEY (`main_category_id`) REFERENCES `MainCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

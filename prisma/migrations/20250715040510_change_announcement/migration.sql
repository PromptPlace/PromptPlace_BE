/*
  Warnings:

  - You are about to drop the `Notice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Notice` DROP FOREIGN KEY `Notice_writer_id_fkey`;

-- DropTable
DROP TABLE `Notice`;

-- CreateTable
CREATE TABLE `Announcement` (
    `announcement_id` INTEGER NOT NULL AUTO_INCREMENT,
    `writer_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `is_visible` BOOLEAN NOT NULL,
    `file_url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`announcement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

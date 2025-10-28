-- AlterTable
ALTER TABLE `User` ADD COLUMN `userstatus` ENUM('active', 'banned', 'deleted') NOT NULL DEFAULT 'active';

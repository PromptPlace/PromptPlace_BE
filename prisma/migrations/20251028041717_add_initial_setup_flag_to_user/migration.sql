-- AlterTable
ALTER TABLE `User` ADD COLUMN `is_initial_setup_required` BOOLEAN NOT NULL DEFAULT true;

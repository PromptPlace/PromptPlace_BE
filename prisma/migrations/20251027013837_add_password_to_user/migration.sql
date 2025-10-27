/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `password` VARCHAR(255) NOT NULL;

UPDATE `User` SET `password` = 'temp_insecure_password';

ALTER TABLE `User` MODIFY COLUMN `password` VARCHAR(255) NOT NULL;
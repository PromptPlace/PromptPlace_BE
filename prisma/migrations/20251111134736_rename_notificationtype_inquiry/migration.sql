/*
  Warnings:

  - The values [INQUIRY_REPLY] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notification` MODIFY `type` ENUM('FOLLOW', 'NEW_PROMPT', 'INQUIRY', 'ANNOUNCEMENT', 'REPORT') NOT NULL;

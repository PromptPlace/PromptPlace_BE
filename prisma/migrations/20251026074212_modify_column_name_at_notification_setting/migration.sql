/*
  Warnings:

  - You are about to drop the column `lastNotificationCheckTime` on the `UserNotificationSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `UserNotificationSetting` DROP COLUMN `lastNotificationCheckTime`,
    ADD COLUMN `last_notification_check_time` DATETIME(3) NULL;

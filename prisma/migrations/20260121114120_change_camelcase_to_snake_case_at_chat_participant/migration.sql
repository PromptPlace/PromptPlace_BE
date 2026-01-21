/*
  Warnings:

  - You are about to drop the column `unreadCount` on the `ChatParticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ChatParticipant` DROP COLUMN `unreadCount`,
    ADD COLUMN `unread_count` INTEGER NOT NULL DEFAULT 0;

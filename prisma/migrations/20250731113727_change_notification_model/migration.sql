/*
  Warnings:

  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `actor_id` INTEGER NULL,
    ADD COLUMN `link_url` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('FOLLOW', 'NEW_PROMPT', 'INQUIRY_REPLY', 'ANNOUNCEMENT', 'REPORT') NOT NULL;

-- CreateTable
CREATE TABLE `NotificationSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `prompter_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationSubscription_user_id_prompter_id_key`(`user_id`, `prompter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Notification_type_idx` ON `Notification`(`type`);

-- AddForeignKey
ALTER TABLE `NotificationSubscription` ADD CONSTRAINT `NotificationSubscription_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationSubscription` ADD CONSTRAINT `NotificationSubscription_prompter_id_fkey` FOREIGN KEY (`prompter_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

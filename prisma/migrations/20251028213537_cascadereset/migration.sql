-- DropForeignKey
ALTER TABLE `Announcement` DROP FOREIGN KEY `Announcement_writer_id_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_actor_id_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `NotificationSubscription` DROP FOREIGN KEY `NotificationSubscription_prompter_id_fkey`;

-- DropForeignKey
ALTER TABLE `NotificationSubscription` DROP FOREIGN KEY `NotificationSubscription_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Prompt` DROP FOREIGN KEY `Prompt_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptLike` DROP FOREIGN KEY `PromptLike_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptReport` DROP FOREIGN KEY `PromptReport_reporter_id_fkey`;

-- DropForeignKey
ALTER TABLE `Purchase` DROP FOREIGN KEY `Purchase_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Settlement` DROP FOREIGN KEY `Settlement_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Tip` DROP FOREIGN KEY `Tip_writer_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserConsent` DROP FOREIGN KEY `UserConsent_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserSNS` DROP FOREIGN KEY `UserSNS_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `WithdrawRequest` DROP FOREIGN KEY `WithdrawRequest_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `UserConsent` ADD CONSTRAINT `UserConsent_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSNS` ADD CONSTRAINT `UserSNS_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptLike` ADD CONSTRAINT `PromptLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tip` ADD CONSTRAINT `Tip_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationSubscription` ADD CONSTRAINT `NotificationSubscription_prompter_id_fkey` FOREIGN KEY (`prompter_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationSubscription` ADD CONSTRAINT `NotificationSubscription_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WithdrawRequest` ADD CONSTRAINT `WithdrawRequest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptReport` ADD CONSTRAINT `PromptReport_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settlement` ADD CONSTRAINT `Settlement_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

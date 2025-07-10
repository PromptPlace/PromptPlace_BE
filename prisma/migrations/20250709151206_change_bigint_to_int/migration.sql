/*
  Warnings:

  - The primary key for the `Following` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `follow_id` on the `Following` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `follower_id` on the `Following` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `following_id` on the `Following` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Inquiry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `inquiry_id` on the `Inquiry` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `sender_id` on the `Inquiry` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `receiver_id` on the `Inquiry` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `InquiryReply` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `reply_id` on the `InquiryReply` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `inquiry_id` on the `InquiryReply` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `receiver_id` on the `InquiryReply` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `message_id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `sender_id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `receiver_id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Model` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `model_id` on the `Model` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Notice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `notice_id` on the `Notice` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `writer_id` on the `Notice` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `notification_id` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Payment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `payment_id` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `purchase_id` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Prompt` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `prompt_id` on the `Prompt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `Prompt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `downloads` on the `Prompt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `views` on the `Prompt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `likes` on the `Prompt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `review_counts` on the `Prompt` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `PromptImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `image_id` on the `PromptImage` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `prompt_id` on the `PromptImage` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `PromptModel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `promptmodel_id` on the `PromptModel` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `prompt_id` on the `PromptModel` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `model_id` on the `PromptModel` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `PromptReport` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `prompt_id` on the `PromptReport` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `PromptTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `prompttag_id` on the `PromptTag` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `prompt_id` on the `PromptTag` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `tag_id` on the `PromptTag` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `purchase_id` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `prompt_id` on the `Purchase` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `review_id` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `prompt_id` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Settlement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `settlement_id` on the `Settlement` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `payment_id` on the `Settlement` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `tag_id` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Tip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `tip_id` on the `Tip` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `writer_id` on the `Tip` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `user_id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `UserProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `profile_id` on the `UserProfile` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `UserProfile` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `UserSNS` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `sns_id` on the `UserSNS` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `UserSNS` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `WithdrawRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `withdraw_request_id` on the `WithdrawRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `WithdrawRequest` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Following` DROP FOREIGN KEY `Following_follower_id_fkey`;

-- DropForeignKey
ALTER TABLE `Following` DROP FOREIGN KEY `Following_following_id_fkey`;

-- DropForeignKey
ALTER TABLE `Inquiry` DROP FOREIGN KEY `Inquiry_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `Inquiry` DROP FOREIGN KEY `Inquiry_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `InquiryReply` DROP FOREIGN KEY `InquiryReply_inquiry_id_fkey`;

-- DropForeignKey
ALTER TABLE `InquiryReply` DROP FOREIGN KEY `InquiryReply_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_receiver_id_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_sender_id_fkey`;

-- DropForeignKey
ALTER TABLE `Notice` DROP FOREIGN KEY `Notice_writer_id_fkey`;

-- DropForeignKey
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_purchase_id_fkey`;

-- DropForeignKey
ALTER TABLE `Prompt` DROP FOREIGN KEY `Prompt_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptImage` DROP FOREIGN KEY `PromptImage_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptModel` DROP FOREIGN KEY `PromptModel_model_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptModel` DROP FOREIGN KEY `PromptModel_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptReport` DROP FOREIGN KEY `PromptReport_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptReport` DROP FOREIGN KEY `PromptReport_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptTag` DROP FOREIGN KEY `PromptTag_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `PromptTag` DROP FOREIGN KEY `PromptTag_tag_id_fkey`;

-- DropForeignKey
ALTER TABLE `Purchase` DROP FOREIGN KEY `Purchase_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `Purchase` DROP FOREIGN KEY `Purchase_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_prompt_id_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Settlement` DROP FOREIGN KEY `Settlement_payment_id_fkey`;

-- DropForeignKey
ALTER TABLE `Tip` DROP FOREIGN KEY `Tip_writer_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserProfile` DROP FOREIGN KEY `UserProfile_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserSNS` DROP FOREIGN KEY `UserSNS_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `WithdrawRequest` DROP FOREIGN KEY `WithdrawRequest_user_id_fkey`;

-- DropIndex
DROP INDEX `Following_follower_id_fkey` ON `Following`;

-- DropIndex
DROP INDEX `Following_following_id_fkey` ON `Following`;

-- DropIndex
DROP INDEX `Inquiry_receiver_id_fkey` ON `Inquiry`;

-- DropIndex
DROP INDEX `Inquiry_sender_id_fkey` ON `Inquiry`;

-- DropIndex
DROP INDEX `InquiryReply_inquiry_id_fkey` ON `InquiryReply`;

-- DropIndex
DROP INDEX `InquiryReply_receiver_id_fkey` ON `InquiryReply`;

-- DropIndex
DROP INDEX `Message_receiver_id_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Message_sender_id_fkey` ON `Message`;

-- DropIndex
DROP INDEX `Notice_writer_id_fkey` ON `Notice`;

-- DropIndex
DROP INDEX `Notification_user_id_fkey` ON `Notification`;

-- DropIndex
DROP INDEX `Prompt_user_id_fkey` ON `Prompt`;

-- DropIndex
DROP INDEX `PromptImage_prompt_id_fkey` ON `PromptImage`;

-- DropIndex
DROP INDEX `PromptModel_model_id_fkey` ON `PromptModel`;

-- DropIndex
DROP INDEX `PromptModel_prompt_id_fkey` ON `PromptModel`;

-- DropIndex
DROP INDEX `PromptReport_prompt_id_fkey` ON `PromptReport`;

-- DropIndex
DROP INDEX `PromptReport_user_id_fkey` ON `PromptReport`;

-- DropIndex
DROP INDEX `PromptTag_prompt_id_fkey` ON `PromptTag`;

-- DropIndex
DROP INDEX `PromptTag_tag_id_fkey` ON `PromptTag`;

-- DropIndex
DROP INDEX `Purchase_prompt_id_fkey` ON `Purchase`;

-- DropIndex
DROP INDEX `Purchase_user_id_fkey` ON `Purchase`;

-- DropIndex
DROP INDEX `Review_prompt_id_fkey` ON `Review`;

-- DropIndex
DROP INDEX `Review_user_id_fkey` ON `Review`;

-- DropIndex
DROP INDEX `Tip_writer_id_fkey` ON `Tip`;

-- DropIndex
DROP INDEX `UserSNS_user_id_fkey` ON `UserSNS`;

-- DropIndex
DROP INDEX `WithdrawRequest_user_id_fkey` ON `WithdrawRequest`;

-- AlterTable
ALTER TABLE `Following` DROP PRIMARY KEY,
    MODIFY `follow_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `follower_id` INTEGER NOT NULL,
    MODIFY `following_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`follow_id`);

-- AlterTable
ALTER TABLE `Inquiry` DROP PRIMARY KEY,
    MODIFY `inquiry_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `sender_id` INTEGER NOT NULL,
    MODIFY `receiver_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`inquiry_id`);

-- AlterTable
ALTER TABLE `InquiryReply` DROP PRIMARY KEY,
    MODIFY `reply_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `inquiry_id` INTEGER NOT NULL,
    MODIFY `receiver_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`reply_id`);

-- AlterTable
ALTER TABLE `Message` DROP PRIMARY KEY,
    MODIFY `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `sender_id` INTEGER NOT NULL,
    MODIFY `receiver_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`message_id`);

-- AlterTable
ALTER TABLE `Model` DROP PRIMARY KEY,
    MODIFY `model_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`model_id`);

-- AlterTable
ALTER TABLE `Notice` DROP PRIMARY KEY,
    MODIFY `notice_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `writer_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`notice_id`);

-- AlterTable
ALTER TABLE `Notification` DROP PRIMARY KEY,
    MODIFY `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`notification_id`);

-- AlterTable
ALTER TABLE `Payment` DROP PRIMARY KEY,
    MODIFY `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `purchase_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`payment_id`);

-- AlterTable
ALTER TABLE `Prompt` DROP PRIMARY KEY,
    MODIFY `prompt_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `downloads` INTEGER NOT NULL,
    MODIFY `views` INTEGER NOT NULL,
    MODIFY `likes` INTEGER NOT NULL,
    MODIFY `review_counts` INTEGER NOT NULL,
    ADD PRIMARY KEY (`prompt_id`);

-- AlterTable
ALTER TABLE `PromptImage` DROP PRIMARY KEY,
    MODIFY `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `prompt_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`image_id`);

-- AlterTable
ALTER TABLE `PromptModel` DROP PRIMARY KEY,
    MODIFY `promptmodel_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `prompt_id` INTEGER NOT NULL,
    MODIFY `model_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`promptmodel_id`);

-- AlterTable
ALTER TABLE `PromptReport` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `prompt_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PromptTag` DROP PRIMARY KEY,
    MODIFY `prompttag_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `prompt_id` INTEGER NOT NULL,
    MODIFY `tag_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`prompttag_id`);

-- AlterTable
ALTER TABLE `Purchase` DROP PRIMARY KEY,
    MODIFY `purchase_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `prompt_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`purchase_id`);

-- AlterTable
ALTER TABLE `Review` DROP PRIMARY KEY,
    MODIFY `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `prompt_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`review_id`);

-- AlterTable
ALTER TABLE `Settlement` DROP PRIMARY KEY,
    MODIFY `settlement_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `payment_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`settlement_id`);

-- AlterTable
ALTER TABLE `Tag` DROP PRIMARY KEY,
    MODIFY `tag_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`tag_id`);

-- AlterTable
ALTER TABLE `Tip` DROP PRIMARY KEY,
    MODIFY `tip_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `writer_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`tip_id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`user_id`);

-- AlterTable
ALTER TABLE `UserProfile` DROP PRIMARY KEY,
    MODIFY `profile_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`profile_id`);

-- AlterTable
ALTER TABLE `UserSNS` DROP PRIMARY KEY,
    MODIFY `sns_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`sns_id`);

-- AlterTable
ALTER TABLE `WithdrawRequest` DROP PRIMARY KEY,
    MODIFY `withdraw_request_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`withdraw_request_id`);

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSNS` ADD CONSTRAINT `UserSNS_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Following` ADD CONSTRAINT `Following_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Following` ADD CONSTRAINT `Following_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notice` ADD CONSTRAINT `Notice_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tip` ADD CONSTRAINT `Tip_writer_id_fkey` FOREIGN KEY (`writer_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inquiry` ADD CONSTRAINT `Inquiry_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InquiryReply` ADD CONSTRAINT `InquiryReply_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `Inquiry`(`inquiry_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InquiryReply` ADD CONSTRAINT `InquiryReply_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WithdrawRequest` ADD CONSTRAINT `WithdrawRequest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prompt` ADD CONSTRAINT `Prompt_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptModel` ADD CONSTRAINT `PromptModel_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptModel` ADD CONSTRAINT `PromptModel_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `Model`(`model_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptTag` ADD CONSTRAINT `PromptTag_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptTag` ADD CONSTRAINT `PromptTag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`tag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptImage` ADD CONSTRAINT `PromptImage_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptReport` ADD CONSTRAINT `PromptReport_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptReport` ADD CONSTRAINT `PromptReport_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `Purchase`(`purchase_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settlement` ADD CONSTRAINT `Settlement_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payment`(`payment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

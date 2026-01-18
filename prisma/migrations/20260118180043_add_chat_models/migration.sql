-- CreateTable
CREATE TABLE `ChatRoom` (
    `room_id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_message_id` INTEGER NULL,
    `user_id1` INTEGER NOT NULL,
    `user_id2` INTEGER NOT NULL,

    UNIQUE INDEX `ChatRoom_last_message_id_key`(`last_message_id`),
    UNIQUE INDEX `ChatRoom_user_id1_user_id2_key`(`user_id1`, `user_id2`),
    PRIMARY KEY (`room_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatMessage` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sender_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,

    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChatParticipant` (
    `chat_participant_id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `left_at` DATETIME(3) NULL,
    `room_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `last_read_message_id` INTEGER NULL,

    UNIQUE INDEX `ChatParticipant_room_id_user_id_key`(`room_id`, `user_id`),
    PRIMARY KEY (`chat_participant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBlock` (
    `block_id` INTEGER NOT NULL AUTO_INCREMENT,
    `blocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `blocker_id` INTEGER NOT NULL,
    `blocked_id` INTEGER NOT NULL,

    UNIQUE INDEX `UserBlock_blocker_id_blocked_id_key`(`blocker_id`, `blocked_id`),
    PRIMARY KEY (`block_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachment` (
    `attachment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `message_id` INTEGER NOT NULL,
    `url` TEXT NOT NULL,
    `type` ENUM('IMAGE', 'FILE') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Attachment_message_id_idx`(`message_id`),
    PRIMARY KEY (`attachment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_last_message_id_fkey` FOREIGN KEY (`last_message_id`) REFERENCES `ChatMessage`(`message_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_user_id1_fkey` FOREIGN KEY (`user_id1`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_user_id2_fkey` FOREIGN KEY (`user_id2`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `ChatRoom`(`room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `ChatRoom`(`room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatParticipant` ADD CONSTRAINT `ChatParticipant_last_read_message_id_fkey` FOREIGN KEY (`last_read_message_id`) REFERENCES `ChatMessage`(`message_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBlock` ADD CONSTRAINT `UserBlock_blocker_id_fkey` FOREIGN KEY (`blocker_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBlock` ADD CONSTRAINT `UserBlock_blocked_id_fkey` FOREIGN KEY (`blocked_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `ChatMessage`(`message_id`) ON DELETE CASCADE ON UPDATE CASCADE;

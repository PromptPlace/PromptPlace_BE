-- CreateTable
CREATE TABLE `PromptLike` (
    `like_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `prompt_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PromptLike_user_id_prompt_id_key`(`user_id`, `prompt_id`),
    PRIMARY KEY (`like_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PromptLike` ADD CONSTRAINT `PromptLike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PromptLike` ADD CONSTRAINT `PromptLike_prompt_id_fkey` FOREIGN KEY (`prompt_id`) REFERENCES `Prompt`(`prompt_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `PromptStatDaily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prompt_id` INTEGER NOT NULL,
    `snapshot_date` VARCHAR(10) NOT NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PromptStatDaily_snapshot_date_idx`(`snapshot_date`),
    UNIQUE INDEX `PromptStatDaily_prompt_id_snapshot_date_key`(`prompt_id`, `snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

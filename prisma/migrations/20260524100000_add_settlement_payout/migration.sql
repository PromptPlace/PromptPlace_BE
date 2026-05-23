-- CreateTable: SettlementPayout (#491 PR D)
CREATE TABLE `SettlementPayout` (
    `payout_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `cycle_start` DATETIME(3) NOT NULL,
    `cycle_end` DATETIME(3) NOT NULL,
    `amount_gross` INTEGER NOT NULL DEFAULT 0,
    `amount_refund` INTEGER NOT NULL DEFAULT 0,
    `carry_over_prev` INTEGER NOT NULL DEFAULT 0,
    `amount_net` INTEGER NOT NULL,
    `billing_tran_id` VARCHAR(64) NULL,
    `group_key` VARCHAR(64) NULL,
    `api_tran_id` VARCHAR(64) NULL,
    `status` ENUM('Pending','Succeed','Failed','Skipped') NOT NULL DEFAULT 'Pending',
    `reason` VARCHAR(200) NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    UNIQUE INDEX `SettlementPayout_user_id_cycle_start_key`(`user_id`, `cycle_start`),
    INDEX `SettlementPayout_status_idx`(`status`),
    INDEX `SettlementPayout_cycle_start_idx`(`cycle_start`),
    PRIMARY KEY (`payout_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SettlementPayout` ADD CONSTRAINT `SettlementPayout_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

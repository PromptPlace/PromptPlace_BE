-- AlterTable: Purchase 다운로드 시점 컬럼
ALTER TABLE `Purchase` ADD COLUMN `downloaded_at` DATETIME(3) NULL;

-- AlterTable: Status enum에 Refunded 추가
ALTER TABLE `Payment` MODIFY COLUMN `status` ENUM('Pending','Succeed','Failed','Refunded') NOT NULL;
ALTER TABLE `Settlement` MODIFY COLUMN `status` ENUM('Pending','Succeed','Failed','Refunded') NOT NULL;

-- CreateTable: Refund
CREATE TABLE `Refund` (
    `refund_id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_id` INTEGER NOT NULL,
    `payment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `reason` VARCHAR(200) NULL,
    `initiator` VARCHAR(20) NOT NULL,
    `payple_pay_code` VARCHAR(20) NULL,
    `payple_card_trade_num` VARCHAR(64) NULL,
    `refunded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Refund_purchase_id_key`(`purchase_id`),
    UNIQUE INDEX `Refund_payment_id_key`(`payment_id`),
    INDEX `Refund_user_id_idx`(`user_id`),
    PRIMARY KEY (`refund_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_purchase_id_fkey`
    FOREIGN KEY (`purchase_id`) REFERENCES `Purchase`(`purchase_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_payment_id_fkey`
    FOREIGN KEY (`payment_id`) REFERENCES `Payment`(`payment_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Refund` ADD CONSTRAINT `Refund_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Bank` (
    `code` CHAR(3) NOT NULL,
    `name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreRegisteredAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_code` CHAR(3) NOT NULL,
    `account_number` VARCHAR(30) NOT NULL,
    `account_holder` VARCHAR(100) NOT NULL,
    `owner_user_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `PreRegisteredAccount_bank_code_idx`(`bank_code`),
    INDEX `PreRegisteredAccount_account_number_idx`(`account_number`),
    UNIQUE INDEX `uniq_user_prereg_account`(`owner_user_id`, `bank_code`, `account_number`, `account_holder`),
    UNIQUE INDEX `uniq_prereg_id_owner`(`id`, `owner_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBankAccount` (
    `account_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `preregistered_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserBankAccount_user_id_key`(`user_id`),
    UNIQUE INDEX `UserBankAccount_preregistered_id_key`(`preregistered_id`),
    UNIQUE INDEX `uniq_userbank_prereg_user`(`preregistered_id`, `user_id`),
    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreRegisteredAccount` ADD CONSTRAINT `PreRegisteredAccount_bank_code_fkey` FOREIGN KEY (`bank_code`) REFERENCES `Bank`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreRegisteredAccount` ADD CONSTRAINT `PreRegisteredAccount_owner_user_id_fkey` FOREIGN KEY (`owner_user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBankAccount` ADD CONSTRAINT `UserBankAccount_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBankAccount` ADD CONSTRAINT `UserBankAccount_preregistered_id_user_id_fkey` FOREIGN KEY (`preregistered_id`, `user_id`) REFERENCES `PreRegisteredAccount`(`id`, `owner_user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;


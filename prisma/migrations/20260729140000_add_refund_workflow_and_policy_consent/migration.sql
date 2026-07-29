-- AlterTable: Purchase 환불정책 동의 시점 (#533)
ALTER TABLE `Purchase` ADD COLUMN `refund_policy_agreed_at` DATETIME(3) NULL;

-- AlterTable: Refund 수동 환불 워크플로 컬럼 (#533)
-- status 기본값을 COMPLETED로 두어 기존 자동 환불 레코드가 그대로 완료 상태로 백필된다.
ALTER TABLE `Refund`
    ADD COLUMN `status` ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'COMPLETED',
    ADD COLUMN `request_reason` VARCHAR(500) NULL,
    ADD COLUMN `reject_reason` VARCHAR(500) NULL,
    ADD COLUMN `reviewed_by` INTEGER NULL,
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
    ADD COLUMN `payple_fail_code` VARCHAR(40) NULL,
    ADD COLUMN `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- 기존 레코드의 requested_at은 실제 환불 시점으로 맞춘다 (기본값 CURRENT_TIMESTAMP 대신).
UPDATE `Refund` SET `requested_at` = `refunded_at`;

-- refunded_at은 "환불 완료 시각"으로 의미를 좁힌다.
-- REQUESTED/REJECTED 단계에서 값이 채워지면 완료된 환불로 오인되므로 nullable + 기본값 제거.
-- 기존 레코드는 모두 COMPLETED이므로 값이 그대로 유지된다.
ALTER TABLE `Refund` MODIFY COLUMN `refunded_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Refund_status_idx` ON `Refund`(`status`);

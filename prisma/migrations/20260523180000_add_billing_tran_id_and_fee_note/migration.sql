-- AlterTable: 정산지급대행 빌링키 컬럼 추가 (#491)
ALTER TABLE `SettlementAccount` ADD COLUMN `billing_tran_id` VARCHAR(64) NULL;

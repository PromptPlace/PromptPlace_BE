-- 외래키 잠깐 해제 (Payment.purchase_id)
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_purchase_id_fkey`;

/* =========================
   Payment: iamport_uid -> imp_uid (데이터 보존)
   ========================= */

-- 1) 새 컬럼을 일단 NULL 허용으로 추가
ALTER TABLE `Payment`
  ADD COLUMN `imp_uid` VARCHAR(191) NULL;

-- 2) 백필: 기존 값 복사 (기존 컬럼명: iamport_uid)
UPDATE `Payment`
SET `imp_uid` = `iamport_uid`
WHERE `imp_uid` IS NULL;

-- 3) NOT NULL로 승격
ALTER TABLE `Payment`
  MODIFY `imp_uid` VARCHAR(191) NOT NULL;

-- 4) 유니크 제약 추가 (중복 있으면 실패하므로 사전 점검 권장)
CREATE UNIQUE INDEX `Payment_imp_uid_key` ON `Payment`(`imp_uid`);

-- 기존 컬럼 제거 (더 이상 안 쓸 때만)
ALTER TABLE `Payment` DROP COLUMN `iamport_uid`;

-- 5) provider를 enum으로 변경 (cast 주의)
ALTER TABLE `Payment`
  MODIFY `provider` ENUM('kakaopay', 'tosspayments') NOT NULL;

-- 6) merchant_uid 유니크 (중복 있으면 실패)
CREATE UNIQUE INDEX `Payment_merchant_uid_key` ON `Payment`(`merchant_uid`);

/* =========================
   Settlement: user_id 추가 + 백필
   ========================= */

-- 1) 일단 NULL 허용으로 추가
ALTER TABLE `Settlement`
  ADD COLUMN `user_id` INTEGER NULL;

-- 2) 백필: 어떤 user_id를 넣을지 결정
UPDATE `Settlement` s
JOIN `Payment` p ON p.payment_id = s.payment_id
JOIN `Purchase` pu ON pu.purchase_id = p.purchase_id
SET s.user_id = pu.user_id
WHERE s.user_id IS NULL;

-- 3) NOT NULL로 승격
ALTER TABLE `Settlement`
  MODIFY `user_id` INTEGER NOT NULL;

-- 4) 인덱스 + FK 추가
CREATE INDEX `Settlement_user_id_idx` ON `Settlement`(`user_id`);

ALTER TABLE `Settlement`
  ADD CONSTRAINT `Settlement_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

/* =========================
   외래키 복구
   ========================= */

ALTER TABLE `Payment`
  ADD CONSTRAINT `Payment_purchase_id_fkey`
  FOREIGN KEY (`purchase_id`) REFERENCES `Purchase`(`purchase_id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

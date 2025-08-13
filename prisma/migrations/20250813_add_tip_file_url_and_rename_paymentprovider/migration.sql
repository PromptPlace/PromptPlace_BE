-- Tip.file_url 추가
ALTER TABLE `Tip`
  ADD COLUMN `file_url` VARCHAR(255) NULL;

-- 1) enum에 신/구 값 모두 허용
ALTER TABLE `Payment`
  MODIFY `provider` ENUM('kakaopay', 'tosspayments', 'tosspay') NOT NULL;

-- 2) 데이터 값 치환
UPDATE `Payment`
SET `provider` = 'tosspay'
WHERE `provider` = 'tosspayments';

-- 3) 구 값 제거 (최종 enum)
ALTER TABLE `Payment`
  MODIFY `provider` ENUM('kakaopay', 'tosspay') NOT NULL;

-- 사업자등록증은 공개/직접 URL 대신 S3 객체 키만 저장한다.
-- 기존 업로드 코드가 생성한 virtual-hosted S3 URL만 안전하게 변환한다.
UPDATE `SettlementAccount`
SET `business_license_url` = SUBSTRING(
  `business_license_url`,
  LOCATE('business-licenses/', `business_license_url`)
)
WHERE `business_license_url` LIKE 'https://%.amazonaws.com/business-licenses/%';

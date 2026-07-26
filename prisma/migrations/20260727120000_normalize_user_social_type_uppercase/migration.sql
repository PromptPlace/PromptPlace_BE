-- Backfill: legacy rows had lowercase social_type ('google', 'naver', 'kakao').
-- Current write paths (config/social/*.ts, auth.service.ts) always store uppercase,
-- so this one-shot normalization aligns historical data with the code contract.
UPDATE `User`
SET `social_type` = UPPER(`social_type`)
WHERE `social_type` IN ('google', 'naver', 'kakao');

-- WARNING: This script only deletes records from the database.
-- It does NOT delete the associated images from the S3 bucket, which will result in orphaned files.
-- It is highly recommended to handle S3 file deletion through the application logic before running this script.

START TRANSACTION;

-- Settlements, Payments, and Purchases are deleted first to handle nested dependencies
DELETE s FROM Settlement s
INNER JOIN Payment p ON s.payment_id = p.payment_id
INNER JOIN Purchase pu ON p.purchase_id = pu.purchase_id
WHERE pu.prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);

DELETE p FROM Payment p
INNER JOIN Purchase pu ON p.purchase_id = pu.purchase_id
WHERE pu.prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);

DELETE FROM Purchase
WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);

-- Other direct dependencies of the Prompt table
DELETE FROM PromptLike WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);
DELETE FROM Review WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);
DELETE FROM PromptReport WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);
DELETE FROM PromptCategory WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);
DELETE FROM PromptModel WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);
DELETE FROM PromptImage WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);

-- Finally, delete the prompts themselves
DELETE FROM Prompt
WHERE prompt_id NOT IN (2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136);

COMMIT;

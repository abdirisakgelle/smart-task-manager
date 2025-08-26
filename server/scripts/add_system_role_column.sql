-- Adds system_role column to users
-- Note: MySQL before 8.0.29 does not support IF NOT EXISTS for ADD COLUMN
-- Run existence check beforehand in a migration runner if needed

ALTER TABLE users
  ADD COLUMN system_role ENUM('admin','ceo') NULL AFTER password_hash;

-- Optional backfill example (adjust as needed)
-- UPDATE users SET system_role = 'admin' WHERE username IN ('admin');

-- Verify
-- SELECT user_id, username, system_role FROM users ORDER BY user_id LIMIT 20;

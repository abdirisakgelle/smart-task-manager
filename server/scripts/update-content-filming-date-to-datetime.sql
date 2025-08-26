-- Migration script to update content.filming_date from DATE to DATETIME
-- This fixes the issue where time information was being truncated

-- Step 1: Add a temporary DATETIME column
ALTER TABLE content 
ADD COLUMN filming_date_datetime DATETIME NULL 
AFTER filming_date;

-- Step 2: Convert existing DATE values to DATETIME (add default time 23:59:59)
UPDATE content 
SET filming_date_datetime = CONCAT(filming_date, ' 23:59:59')
WHERE filming_date IS NOT NULL;

-- Step 3: Drop the old DATE column
ALTER TABLE content 
DROP COLUMN filming_date;

-- Step 4: Rename the new DATETIME column to filming_date
ALTER TABLE content 
CHANGE COLUMN filming_date_datetime filming_date DATETIME NULL;

-- Step 5: Add index for performance
CREATE INDEX idx_content_filming_date ON content(filming_date);

-- Verify the change
DESCRIBE content;

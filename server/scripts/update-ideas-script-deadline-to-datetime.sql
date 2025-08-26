-- Migration script to update ideas.script_deadline from DATE to DATETIME
-- This fixes the issue where time information was being truncated

-- Step 1: Add a temporary DATETIME column
ALTER TABLE ideas 
ADD COLUMN script_deadline_datetime DATETIME NULL 
AFTER script_deadline;

-- Step 2: Convert existing DATE values to DATETIME (add default time 23:59:59)
UPDATE ideas 
SET script_deadline_datetime = CONCAT(script_deadline, ' 23:59:59')
WHERE script_deadline IS NOT NULL;

-- Step 3: Drop the old DATE column
ALTER TABLE ideas 
DROP COLUMN script_deadline;

-- Step 4: Rename the new DATETIME column to script_deadline
ALTER TABLE ideas 
CHANGE COLUMN script_deadline_datetime script_deadline DATETIME NULL;

-- Step 5: Add index for performance
CREATE INDEX idx_ideas_script_deadline ON ideas(script_deadline);

-- Verify the change
DESCRIBE ideas;

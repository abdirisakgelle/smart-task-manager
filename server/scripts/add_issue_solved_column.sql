-- Migration script to add issue_solved column to follow_ups table
-- Run this script to update existing databases

ALTER TABLE follow_ups ADD COLUMN issue_solved BOOLEAN AFTER follow_up_date; 
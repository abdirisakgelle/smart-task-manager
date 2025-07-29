-- Add content_status column to existing content table
ALTER TABLE content ADD COLUMN content_status VARCHAR(50) NOT NULL DEFAULT 'in_progress' AFTER script_status; 
-- Add source tracking fields to tasks table
-- This allows tasks to be linked to their originating module (e.g., ideas, content, etc.)

ALTER TABLE tasks 
ADD COLUMN source_module VARCHAR(50) NULL COMMENT 'Module that created this task (e.g., ideas, content)',
ADD COLUMN source_id INT NULL COMMENT 'ID from the source module (e.g., idea_id)';

-- Create indexes for the new fields for better query performance
CREATE INDEX idx_tasks_source_module ON tasks(source_module);
CREATE INDEX idx_tasks_source_id ON tasks(source_id);
CREATE INDEX idx_tasks_source_composite ON tasks(source_module, source_id);

-- Add comments to document the purpose
ALTER TABLE tasks 
MODIFY COLUMN source_module VARCHAR(50) NULL COMMENT 'Module that created this task (e.g., ideas, content, boards)',
MODIFY COLUMN source_id INT NULL COMMENT 'ID from the source module (e.g., idea_id, content_id, board_id)'; 
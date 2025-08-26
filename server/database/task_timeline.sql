-- Task Timeline Table
-- This table tracks all status changes and important events for tasks
-- Allows admins and managers to see the complete history of task progress

CREATE TABLE IF NOT EXISTS task_timeline (
  timeline_id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  event_type ENUM('created', 'status_changed', 'assigned', 'reassigned', 'commented', 'due_date_changed') NOT NULL,
  old_value VARCHAR(255),
  new_value VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  
  INDEX idx_task_id (task_id),
  INDEX idx_created_at (created_at),
  INDEX idx_event_type (event_type)
);

-- Insert initial timeline events for existing tasks
INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description)
SELECT 
  t.task_id,
  t.created_by,
  'created',
  NULL,
  t.status,
  CONCAT('Task created and assigned to ', e.name)
FROM tasks t
JOIN employees e ON t.assigned_to = e.employee_id
WHERE t.created_at IS NOT NULL;

-- Insert status change events for tasks that have been updated
INSERT INTO task_timeline (task_id, user_id, event_type, old_value, new_value, description)
SELECT 
  t.task_id,
  t.created_by,
  'status_changed',
  'Not Started',
  t.status,
  CONCAT('Status changed to ', t.status)
FROM tasks t
WHERE t.status != 'Not Started' AND t.updated_at > t.created_at; 
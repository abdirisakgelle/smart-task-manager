-- Tasks table for simplified task assignment system
CREATE TABLE IF NOT EXISTS tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INT NOT NULL,         -- FK to employees.employee_id
  created_by INT NOT NULL,          -- FK to users.user_id
  status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- SMS logs table for tracking SMS notifications
CREATE TABLE IF NOT EXISTS sms_logs (
  sms_id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,              -- FK to employees.employee_id
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('Sent', 'Failed') DEFAULT 'Sent',
  related_task_id INT,                    -- FK to tasks.task_id
  sent_by INT,                            -- FK to users.user_id
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (related_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL,
  FOREIGN KEY (sent_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_sms_logs_recipient_id ON sms_logs(recipient_id);
CREATE INDEX idx_sms_logs_related_task_id ON sms_logs(related_task_id);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at); 
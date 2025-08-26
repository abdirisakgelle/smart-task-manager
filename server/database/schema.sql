-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'agent', 'supervisor', 'media', 'follow_up', 'ceo') DEFAULT 'agent',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL,
  UNIQUE KEY unique_employee_user (employee_id)
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  shift VARCHAR(50),
  department VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
        type ENUM('task_assignment', 'task_update', 'task_completion', 'script_assignment', 'idea_assignment', 'content_assignment', 'cast_assignment', 'system') DEFAULT 'task_assignment',
  related_id INT NULL,
  related_type VARCHAR(50) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_phone VARCHAR(20),
  communication_channel VARCHAR(50),
  device_type VARCHAR(50),
  issue_type VARCHAR(100),
  issue_description TEXT,
  agent_id INT NOT NULL,
  first_call_resolution BOOLEAN,
  resolution_status VARCHAR(50),
  end_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  idea_id INT AUTO_INCREMENT PRIMARY KEY,
  submission_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  contributor_id INT NOT NULL,
  script_writer_id INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'bank',
  script_deadline DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contributor_id) REFERENCES employees(employee_id),
  FOREIGN KEY (script_writer_id) REFERENCES employees(employee_id)
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  content_id INT AUTO_INCREMENT PRIMARY KEY,
  idea_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  script_status VARCHAR(50) NOT NULL,
  content_status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  director_id INT NOT NULL,
  filming_date DATE,
  cast_and_presenters TEXT,
  notes TEXT
);

-- Production table
CREATE TABLE IF NOT EXISTS production (
  production_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL,
  editor_id INT NOT NULL,
  production_status VARCHAR(50) NOT NULL,
  completion_date DATE,
  sent_to_social_team BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Social Media table
CREATE TABLE IF NOT EXISTS social_media (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL,
  platforms VARCHAR(255) NOT NULL,
  post_type VARCHAR(50) NOT NULL,
  post_date DATETIME,
  caption TEXT,
  status VARCHAR(50) NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Supervisor Reviews table
CREATE TABLE IF NOT EXISTS supervisor_reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  supervisor_id INT NOT NULL,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  issue_status VARCHAR(50),
  resolved BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  follow_up_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  follow_up_agent_id INT NOT NULL,
  follow_up_date DATE NOT NULL,
  issue_solved BOOLEAN,
  customer_location VARCHAR(255),
  feedback_rating INT,
  satisfied BOOLEAN,
  repeated_issue BOOLEAN,
  resolved_after_follow_up BOOLEAN,
  resolution_status VARCHAR(50),
  follow_up_notes TEXT
);

-- Employee Assignments table
CREATE TABLE IF NOT EXISTS employee_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  assignment_date DATE NOT NULL,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT
);

-- Add indexes for follow-ups performance
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_followups_ticket_id ON follow_ups(ticket_id);
CREATE INDEX idx_supervisor_reviews_ticket_id ON supervisor_reviews(ticket_id);
CREATE INDEX idx_supervisor_reviews_review_date ON supervisor_reviews(review_date);

-- Add indexes for notifications performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  board_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  assign_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- Add indexes for boards and tasks performance
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at); 
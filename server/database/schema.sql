-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'manager') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  status VARCHAR(50) NOT NULL,
  script_deadline DATE,
  priority VARCHAR(20),
  notes TEXT
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  content_id INT AUTO_INCREMENT PRIMARY KEY,
  idea_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  script_status VARCHAR(50) NOT NULL,
  director_id INT NOT NULL,
  filming_date DATE,
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
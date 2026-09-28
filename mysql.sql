CREATE DATABASE IF NOT EXISTS public_transport_grievance;
USE public_transport_grievance;

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(40) NOT NULL UNIQUE,
  passenger_name VARCHAR(120) NOT NULL,
  passenger_email VARCHAR(160),
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(30) NOT NULL DEFAULT 'Open',
  bus_number VARCHAR(40),
  route VARCHAR(160),
  location VARCHAR(160),
  assigned_to VARCHAR(120),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority)
);

CREATE TABLE IF NOT EXISTS ticket_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(40) NOT NULL,
  status VARCHAR(30) NOT NULL,
  note TEXT,
  updated_by VARCHAR(120),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_history_ticket (ticket_id)
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  role VARCHAR(30) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (name, email, role) VALUES
('Demo Passenger', 'passenger@demo.com', 'passenger'),
('Transport Admin', 'admin@demo.com', 'admin'),
('Support Staff', 'staff@demo.com', 'staff');

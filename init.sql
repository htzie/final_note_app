CREATE DATABASE IF NOT EXISTS final_notesdb;
USE final_notesdb;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  color VARCHAR(20) DEFAULT '#ffffff',
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample admin user (password = admin123)
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2b$10$0G0lq7Wn.Nvz9I1f6KpEGe2rQe5zv8c1sYgEoD8t4qk1ZpN6uGm7K', 'admin');
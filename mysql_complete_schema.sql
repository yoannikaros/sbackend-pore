-- Seangkatan Database Schema (MySQL)
-- Complete database schema for all features

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'school_admin', 'teacher', 'parent', 'student') NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email),
  INDEX idx_active (is_active)
);

-- Classes Table
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  grade_level VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  teacher_id INT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_active (is_active)
);

-- User Class Relations (for students and parents)
CREATE TABLE user_classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  class_id INT NOT NULL,
  relationship ENUM('student', 'parent') NOT NULL,
  student_id INT NULL, -- for parents, reference to their child
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE KEY unique_user_class (user_id, class_id),
  INDEX idx_user (user_id),
  INDEX idx_class (class_id)
);

-- ===== EVENT PLANNER TABLES =====

-- Events Table
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('parent_meeting', 'class_competition', 'school_event') NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(200),
  created_by INT NOT NULL,
  max_participants INT DEFAULT 0,
  status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
  class_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  INDEX idx_date (event_date),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_class (class_id)
);

-- Event Bookings Table
CREATE TABLE event_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  student_id INT, -- for parent meetings
  time_slot DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  INDEX idx_event (event_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

-- ===== QUIZ SYSTEM TABLES =====

-- Quizzes Table
CREATE TABLE quizzes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category ENUM('reading', 'writing', 'math', 'science') NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
  time_limit INT DEFAULT 0, -- in minutes
  created_by INT NOT NULL,
  class_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  INDEX idx_category (category),
  INDEX idx_difficulty (difficulty),
  INDEX idx_class (class_id),
  INDEX idx_active (is_active)
);

-- Quiz Questions Table
CREATE TABLE quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  type ENUM('multiple_choice', 'true_false', 'fill_blank') NOT NULL,
  correct_answer TEXT NOT NULL,
  points INT DEFAULT 1,
  explanation TEXT,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_quiz (quiz_id),
  INDEX idx_order (question_order)
);

-- Quiz Question Options Table (for multiple choice)
CREATE TABLE quiz_question_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text VARCHAR(500) NOT NULL,
  option_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  INDEX idx_question (question_id),
  INDEX idx_order (option_order)
);

-- Quiz Attempts Table
CREATE TABLE quiz_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  total_score INT DEFAULT 0,
  max_score INT NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0,
  time_spent INT DEFAULT 0, -- in seconds
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  INDEX idx_quiz (quiz_id),
  INDEX idx_student (student_id),
  INDEX idx_completed (completed_at)
);

-- Quiz Answers Table
CREATE TABLE quiz_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  answer TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
  INDEX idx_attempt (attempt_id),
  INDEX idx_question (question_id)
);

-- Badges Table
CREATE TABLE badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255), -- SVG or image path
  category VARCHAR(50),
  criteria_type ENUM('quiz_score', 'quiz_count', 'streak') NOT NULL,
  criteria_value INT NOT NULL,
  criteria_category VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active)
);

-- User Badges Table
CREATE TABLE user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  quiz_attempt_id INT, -- reference to earning attempt
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (badge_id) REFERENCES badges(id),
  FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id),
  UNIQUE KEY unique_user_badge (user_id, badge_id),
  INDEX idx_user (user_id),
  INDEX idx_badge (badge_id)
);

-- ===== MADING ONLINE TABLES =====

-- Posts Table
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('artwork', 'assignment', 'project') NOT NULL,
  author_id INT NOT NULL,
  class_id INT NOT NULL,
  subject VARCHAR(100),
  tags JSON,
  status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_author (author_id),
  INDEX idx_class (class_id),
  INDEX idx_status (status),
  INDEX idx_type (type)
);

-- Post Media Files Table
CREATE TABLE post_media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post (post_id)
);

-- Post Likes Table
CREATE TABLE post_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_post_like (post_id, user_id),
  INDEX idx_post (post_id),
  INDEX idx_user (user_id)
);

-- Comments Table
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  author_id INT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id INT, -- for replies
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  moderated_by INT,
  moderated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id),
  FOREIGN KEY (moderated_by) REFERENCES users(id),
  INDEX idx_post (post_id),
  INDEX idx_author (author_id),
  INDEX idx_status (status),
  INDEX idx_parent (parent_comment_id)
);

-- Comment Likes Table
CREATE TABLE comment_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_comment_like (comment_id, user_id),
  INDEX idx_comment (comment_id),
  INDEX idx_user (user_id)
);

-- ===== GALERI FOTO TABLES =====

-- Albums Table
CREATE TABLE albums (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_photo VARCHAR(500),
  class_id INT NOT NULL,
  created_by INT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  allow_download BOOLEAN DEFAULT TRUE,
  tags JSON,
  photo_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_class (class_id),
  INDEX idx_creator (created_by),
  INDEX idx_public (is_public)
);

-- Photos Table
CREATE TABLE photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  album_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  watermarked_path VARCHAR(500),
  size INT NOT NULL,
  width INT,
  height INT,
  uploaded_by INT NOT NULL,
  caption TEXT,
  tags JSON,
  views INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_album (album_id),
  INDEX idx_uploader (uploaded_by)
);

-- Photo Likes Table
CREATE TABLE photo_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  photo_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_photo_like (photo_id, user_id),
  INDEX idx_photo (photo_id),
  INDEX idx_user (user_id)
);

-- ===== CHAT SYSTEM TABLES =====

-- Chat Rooms Table
CREATE TABLE chat_rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  type ENUM('class_chat', 'parent_channel', 'teacher_room') NOT NULL,
  class_id INT,
  description TEXT,
  created_by INT NOT NULL,
  slow_mode_enabled BOOLEAN DEFAULT FALSE,
  slow_mode_interval INT DEFAULT 0, -- seconds between messages
  allow_stickers BOOLEAN DEFAULT TRUE,
  allow_files BOOLEAN DEFAULT TRUE,
  max_file_size INT DEFAULT 5242880, -- 5MB in bytes
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_class (class_id),
  INDEX idx_active (is_active)
);

-- Chat Room Members Table
CREATE TABLE chat_room_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
  is_muted BOOLEAN DEFAULT FALSE,
  muted_until TIMESTAMP NULL,
  last_message_sent TIMESTAMP NULL, -- for slow mode
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_room_member (room_id, user_id),
  INDEX idx_room (room_id),
  INDEX idx_user (user_id)
);

-- Messages Table
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT,
  type ENUM('text', 'sticker', 'file', 'image') NOT NULL,
  sticker_id INT,
  reply_to_id INT, -- Message ID for replies
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by INT,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (reply_to_id) REFERENCES messages(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id),
  INDEX idx_room (room_id),
  INDEX idx_sender (sender_id),
  INDEX idx_created (created_at),
  INDEX idx_deleted (is_deleted)
);

-- Message Files Table
CREATE TABLE message_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_message (message_id)
);

-- Message Reactions Table
CREATE TABLE message_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_message_reaction (message_id, user_id, emoji),
  INDEX idx_message (message_id),
  INDEX idx_user (user_id)
);

-- Stickers Table
CREATE TABLE stickers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active)
);

-- ===== SYSTEM TABLES =====

-- Notifications Table
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('quiz_result', 'post_approved', 'event_reminder', 'chat_mention', 'badge_earned') NOT NULL,
  reference_id INT, -- ID of related entity (quiz, post, event, etc.)
  reference_type VARCHAR(50), -- Type of related entity
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_type (type),
  INDEX idx_created (created_at)
);

-- System Settings Table
CREATE TABLE system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_key (setting_key)
);

-- Activity Logs Table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('school_name', 'Sekolah Dasar Seangkatan', 'Nama sekolah'),
('school_logo', '', 'Path ke logo sekolah untuk watermark'),
('max_file_size', '5242880', 'Maksimal ukuran file upload (bytes)'),
('allowed_file_types', 'jpg,jpeg,png,gif,pdf,doc,docx', 'Tipe file yang diizinkan'),
('quiz_time_limit_default', '30', 'Default waktu quiz (menit)'),
('slow_mode_default', '5', 'Default slow mode interval (detik)'),
('watermark_opacity', '0.3', 'Opacity watermark pada foto'),
('notification_email_enabled', 'true', 'Enable email notifications');

-- Create indexes for better performance
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_events_date_status ON events(event_date, status);
CREATE INDEX idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
CREATE INDEX idx_posts_class_status ON posts(class_id, status);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
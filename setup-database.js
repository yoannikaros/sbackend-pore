const mysql = require('mysql2/promise');
require('dotenv').config();

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'intt3564_yoannikaros',
  password: process.env.DB_PASSWORD || 'jawabarat123',
  database: process.env.DB_NAME || 'intt3564_seangkatan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Database setup function
async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Memulai setup database...');
    
    // Connect without specifying database first
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    connection = await mysql.createConnection(tempConfig);
    console.log('✅ Koneksi ke MySQL berhasil');
    
    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' berhasil dibuat/sudah ada`);
    
    // Close temporary connection
    await connection.end();
    
    // Connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Koneksi ke database '${dbConfig.database}' berhasil`);
    
    // Create tables
    await createTables(connection);
    
    console.log('🎉 Setup database selesai!');
    
  } catch (error) {
    console.error('❌ Error saat setup database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Koneksi database ditutup');
    }
  }
}

// Create all tables
async function createTables(connection) {
  console.log('📋 Membuat tabel-tabel...');
  
  const tables = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('owner', 'school_admin', 'teacher', 'parent', 'student') NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'classes',
      sql: `CREATE TABLE IF NOT EXISTS classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        grade_level VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        teacher_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )`
    },
    {
      name: 'events',
      sql: `CREATE TABLE IF NOT EXISTS events (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type ENUM('parent_meeting', 'class_competition') NOT NULL,
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
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )`
    },
    {
      name: 'event_bookings',
      sql: `CREATE TABLE IF NOT EXISTS event_bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        student_id INT,
        time_slot DATETIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
      )`
    },
    {
      name: 'quizzes',
      sql: `CREATE TABLE IF NOT EXISTS quizzes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category ENUM('reading', 'writing', 'math', 'science') NOT NULL,
        difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
        time_limit INT DEFAULT 0,
        created_by INT NOT NULL,
        class_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES classes(id)
      )`
    },
    {
      name: 'quiz_questions',
      sql: `CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT,
        question TEXT NOT NULL,
        type ENUM('multiple_choice', 'true_false', 'fill_blank') NOT NULL,
        options JSON,
        correct_answer TEXT NOT NULL,
        points INT DEFAULT 1,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        explanation TEXT,
        order_number INT DEFAULT 1,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`
    },
    {
      name: 'quiz_question_options',
      sql: `CREATE TABLE IF NOT EXISTS quiz_question_options (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT NOT NULL,
        option_text VARCHAR(500) NOT NULL,
        option_order INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
      )`
    },
    {
      name: 'quiz_attempts',
      sql: `CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        quiz_id INT NOT NULL,
        student_id INT NOT NULL,
        total_score INT DEFAULT 0,
        max_score INT NOT NULL,
        percentage DECIMAL(5,2) DEFAULT 0,
        time_spent INT DEFAULT 0,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
        FOREIGN KEY (student_id) REFERENCES users(id)
      )`
    },
    {
      name: 'quiz_answers',
      sql: `CREATE TABLE IF NOT EXISTS quiz_answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        answer TEXT,
        is_correct BOOLEAN DEFAULT FALSE,
        points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
      )`
    },
    {
      name: 'badges',
      sql: `CREATE TABLE IF NOT EXISTS badges (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        category VARCHAR(50),
        criteria_type ENUM('quiz_score', 'quiz_count', 'streak') NOT NULL,
        criteria_value INT NOT NULL,
        criteria_category VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'user_badges',
      sql: `CREATE TABLE IF NOT EXISTS user_badges (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        quiz_attempt_id INT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (badge_id) REFERENCES badges(id),
        FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id),
        UNIQUE KEY unique_user_badge (user_id, badge_id)
      )`
    },
    {
      name: 'posts',
      sql: `CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type ENUM('artwork', 'assignment', 'project') NOT NULL,
        media_files JSON,
        author_id INT NOT NULL,
        class_id INT,
        subject VARCHAR(100),
        tags JSON,
        status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        likes JSON,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      )`
    },
    {
      name: 'comments',
      sql: `CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        post_id INT NOT NULL,
        author_id INT NOT NULL,
        content TEXT NOT NULL,
        parent_comment_id INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        moderated_by INT,
        moderated_at TIMESTAMP NULL,
        likes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id),
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id),
        FOREIGN KEY (moderated_by) REFERENCES users(id)
      )`
    },
    {
      name: 'albums',
      sql: `CREATE TABLE IF NOT EXISTS albums (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        cover_photo VARCHAR(255),
        class_id INT,
        created_by INT NOT NULL,
        is_public BOOLEAN DEFAULT TRUE,
        allow_download BOOLEAN DEFAULT TRUE,
        tags JSON,
        photo_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`
    },
    {
      name: 'photos',
      sql: `CREATE TABLE IF NOT EXISTS photos (
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
        likes JSON,
        views INT DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )`
    },
    {
      name: 'chat_rooms',
      sql: `CREATE TABLE IF NOT EXISTS chat_rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        type ENUM('class_chat', 'parent_channel', 'teacher_room') NOT NULL,
        class_id INT,
        description TEXT,
        members JSON,
        moderators JSON,
        settings JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`
    },
    {
      name: 'messages',
      sql: `CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        room_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT,
        type ENUM('text', 'sticker', 'file', 'image') DEFAULT 'text',
        file_data JSON,
        sticker_id INT,
        reply_to INT,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_by INT,
        deleted_at TIMESTAMP NULL,
        reactions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (reply_to) REFERENCES messages(id),
        FOREIGN KEY (deleted_by) REFERENCES users(id)
      )`
    },
    {
      name: 'stickers',
      sql: `CREATE TABLE IF NOT EXISTS stickers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        image_url VARCHAR(255),
        pack_name VARCHAR(100) DEFAULT 'default',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'user_chat_settings',
      sql: `CREATE TABLE IF NOT EXISTS user_chat_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        sound_enabled BOOLEAN DEFAULT TRUE,
        theme ENUM('light', 'dark') DEFAULT 'light',
        font_size ENUM('small', 'medium', 'large') DEFAULT 'medium',
        auto_download_media BOOLEAN DEFAULT TRUE,
        show_read_receipts BOOLEAN DEFAULT TRUE,
        language VARCHAR(10) DEFAULT 'id',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user (user_id)
      )`
    }
  ];
  
  for (const table of tables) {
    try {
      await connection.execute(table.sql);
      console.log(`  ✅ Tabel '${table.name}' berhasil dibuat`);
    } catch (error) {
      console.error(`  ❌ Error membuat tabel '${table.name}':`, error.message);
      throw error;
    }
  }
  
  console.log('✅ Semua tabel berhasil dibuat');
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup berhasil!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup gagal:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase, createTables };
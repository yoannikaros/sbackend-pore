const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seangkatan_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Sample data seeding function
async function seedDatabase() {
  let connection;
  
  try {
    console.log('🌱 Memulai seeding database...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Koneksi ke database berhasil');
    
    // Check if data already exists
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('⚠️  Database sudah memiliki data. Seeding dibatalkan.');
      console.log('💡 Gunakan --force untuk menimpa data yang ada');
      return;
    }
    
    // Seed users
    await seedUsers(connection);
    
    // Seed classes
    await seedClasses(connection);
    
    // Seed badges
    await seedBadges(connection);
    
    // Seed stickers
    await seedStickers(connection);
    
    // Seed sample events
    await seedEvents(connection);
    
    // Seed sample quizzes
    await seedQuizzes(connection);
    
    // Seed sample albums
    await seedAlbums(connection);
    
    // Seed chat rooms
    await seedChatRooms(connection);
    
    console.log('🎉 Seeding database selesai!');
    
  } catch (error) {
    console.error('❌ Error saat seeding database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Koneksi database ditutup');
    }
  }
}

// Seed users
async function seedUsers(connection) {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      username: 'owner',
      email: 'owner@seangkatan.com',
      password: 'password123',
      role: 'owner',
      full_name: 'System Owner',
      phone: '081234567890'
    },
    {
      username: 'admin',
      email: 'admin@seangkatan.com',
      password: 'password123',
      role: 'school_admin',
      full_name: 'School Administrator',
      phone: '081234567891'
    },
    {
      username: 'teacher1',
      email: 'teacher1@seangkatan.com',
      password: 'password123',
      role: 'teacher',
      full_name: 'Guru Matematika',
      phone: '081234567892'
    },
    {
      username: 'teacher2',
      email: 'teacher2@seangkatan.com',
      password: 'password123',
      role: 'teacher',
      full_name: 'Guru Bahasa Indonesia',
      phone: '081234567893'
    },
    {
      username: 'parent1',
      email: 'parent1@seangkatan.com',
      password: 'password123',
      role: 'parent',
      full_name: 'Orang Tua Siswa 1',
      phone: '081234567894'
    },
    {
      username: 'student1',
      email: 'student1@seangkatan.com',
      password: 'password123',
      role: 'student',
      full_name: 'Siswa Pertama',
      phone: '081234567895'
    },
    {
      username: 'student2',
      email: 'student2@seangkatan.com',
      password: 'password123',
      role: 'student',
      full_name: 'Siswa Kedua',
      phone: '081234567896'
    }
  ];
  
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await connection.execute(
      'INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, user.email, hashedPassword, user.role, user.full_name, user.phone]
    );
    console.log(`  ✅ User '${user.username}' berhasil ditambahkan`);
  }
}

// Seed classes
async function seedClasses(connection) {
  console.log('🏫 Seeding classes...');
  
  const classes = [
    {
      name: 'Kelas 1A',
      grade_level: '1',
      academic_year: '2024/2025',
      teacher_id: 3 // teacher1
    },
    {
      name: 'Kelas 1B',
      grade_level: '1',
      academic_year: '2024/2025',
      teacher_id: 4 // teacher2
    },
    {
      name: 'Kelas 2A',
      grade_level: '2',
      academic_year: '2024/2025',
      teacher_id: 3 // teacher1
    }
  ];
  
  for (const classData of classes) {
    await connection.execute(
      'INSERT INTO classes (name, grade_level, academic_year, teacher_id) VALUES (?, ?, ?, ?)',
      [classData.name, classData.grade_level, classData.academic_year, classData.teacher_id]
    );
    console.log(`  ✅ Class '${classData.name}' berhasil ditambahkan`);
  }
}

// Seed badges
async function seedBadges(connection) {
  console.log('🏆 Seeding badges...');
  
  const badges = [
    {
      name: 'Quiz Master',
      description: 'Menyelesaikan 10 quiz dengan skor minimal 80%',
      icon: '🏆',
      category: 'achievement',
      criteria_type: 'quiz_count',
      criteria_value: 10,
      criteria_category: 'all'
    },
    {
      name: 'Perfect Score',
      description: 'Mendapat skor 100% dalam quiz',
      icon: '⭐',
      category: 'achievement',
      criteria_type: 'quiz_score',
      criteria_value: 100,
      criteria_category: 'all'
    },
    {
      name: 'Math Genius',
      description: 'Menyelesaikan 5 quiz matematika dengan skor minimal 90%',
      icon: '🧮',
      category: 'subject',
      criteria_type: 'quiz_count',
      criteria_value: 5,
      criteria_category: 'math'
    },
    {
      name: 'Reading Champion',
      description: 'Menyelesaikan 5 quiz membaca dengan skor minimal 90%',
      icon: '📚',
      category: 'subject',
      criteria_type: 'quiz_count',
      criteria_value: 5,
      criteria_category: 'reading'
    }
  ];
  
  for (const badge of badges) {
    await connection.execute(
      'INSERT INTO badges (name, description, icon, category, criteria_type, criteria_value, criteria_category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [badge.name, badge.description, badge.icon, badge.category, badge.criteria_type, badge.criteria_value, badge.criteria_category]
    );
    console.log(`  ✅ Badge '${badge.name}' berhasil ditambahkan`);
  }
}

// Seed stickers
async function seedStickers(connection) {
  console.log('😊 Seeding stickers...');
  
  const stickers = [
    {
      name: 'Happy Face',
      category: 'emotions',
      image_path: '/stickers/happy.png',
      image_url: '/stickers/happy.png',
      pack_name: 'Basic Emotions',
      description: 'Stiker wajah bahagia'
    },
    {
      name: 'Thumbs Up',
      category: 'gestures',
      image_path: '/stickers/thumbs-up.png',
      image_url: '/stickers/thumbs-up.png',
      pack_name: 'Basic Gestures',
      description: 'Stiker jempol ke atas'
    },
    {
      name: 'Star',
      category: 'rewards',
      image_path: '/stickers/star.png',
      image_url: '/stickers/star.png',
      pack_name: 'Rewards',
      description: 'Stiker bintang'
    },
    {
      name: 'Heart',
      category: 'emotions',
      image_path: '/stickers/heart.png',
      image_url: '/stickers/heart.png',
      pack_name: 'Basic Emotions',
      description: 'Stiker hati'
    }
  ];
  
  for (const sticker of stickers) {
    await connection.execute(
      'INSERT INTO stickers (name, category, image_path, image_url, pack_name, description) VALUES (?, ?, ?, ?, ?, ?)',
      [sticker.name, sticker.category, sticker.image_path, sticker.image_url, sticker.pack_name, sticker.description]
    );
    console.log(`  ✅ Sticker '${sticker.name}' berhasil ditambahkan`);
  }
}

// Seed events
async function seedEvents(connection) {
  console.log('📅 Seeding events...');
  
  const events = [
    {
      title: 'Pertemuan Orang Tua Kelas 1A',
      description: 'Pertemuan rutin orang tua siswa kelas 1A untuk membahas perkembangan anak',
      type: 'parent_meeting',
      event_date: '2024-02-15',
      start_time: '09:00:00',
      end_time: '11:00:00',
      location: 'Ruang Kelas 1A',
      created_by: 3, // teacher1
      max_participants: 30,
      class_id: 1
    },
    {
      title: 'Lomba Matematika Antar Kelas',
      description: 'Kompetisi matematika untuk siswa kelas 1 dan 2',
      type: 'class_competition',
      event_date: '2024-02-20',
      start_time: '08:00:00',
      end_time: '12:00:00',
      location: 'Aula Sekolah',
      created_by: 2, // admin
      max_participants: 50,
      class_id: null
    }
  ];
  
  for (const event of events) {
    await connection.execute(
      'INSERT INTO events (title, description, type, event_date, start_time, end_time, location, created_by, max_participants, class_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [event.title, event.description, event.type, event.event_date, event.start_time, event.end_time, event.location, event.created_by, event.max_participants, event.class_id]
    );
    console.log(`  ✅ Event '${event.title}' berhasil ditambahkan`);
  }
}

// Seed quizzes
async function seedQuizzes(connection) {
  console.log('📝 Seeding quizzes...');
  
  const quizzes = [
    {
      title: 'Quiz Matematika Dasar',
      description: 'Quiz tentang penjumlahan dan pengurangan untuk kelas 1',
      category: 'math',
      difficulty: 'easy',
      time_limit: 1800, // 30 minutes
      created_by: 3, // teacher1
      class_id: 1
    },
    {
      title: 'Quiz Membaca Pemahaman',
      description: 'Quiz pemahaman bacaan sederhana untuk kelas 1',
      category: 'reading',
      difficulty: 'easy',
      time_limit: 1200, // 20 minutes
      created_by: 4, // teacher2
      class_id: 2
    }
  ];
  
  for (const quiz of quizzes) {
    await connection.execute(
      'INSERT INTO quizzes (title, description, category, difficulty, time_limit, created_by, class_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [quiz.title, quiz.description, quiz.category, quiz.difficulty, quiz.time_limit, quiz.created_by, quiz.class_id]
    );
    console.log(`  ✅ Quiz '${quiz.title}' berhasil ditambahkan`);
  }
}

// Seed albums
async function seedAlbums(connection) {
  console.log('📸 Seeding albums...');
  
  const albums = [
    {
      title: 'Kegiatan Kelas 1A',
      description: 'Dokumentasi kegiatan belajar mengajar di kelas 1A',
      class_id: 1,
      created_by: 3, // teacher1
      is_public: true,
      allow_download: true,
      tags: JSON.stringify(['kelas1a', 'belajar', 'aktivitas'])
    },
    {
      title: 'Lomba Sekolah 2024',
      description: 'Dokumentasi berbagai lomba yang diadakan sekolah tahun 2024',
      class_id: null,
      created_by: 2, // admin
      is_public: true,
      allow_download: false,
      tags: JSON.stringify(['lomba', '2024', 'kompetisi'])
    }
  ];
  
  for (const album of albums) {
    await connection.execute(
      'INSERT INTO albums (title, description, class_id, created_by, is_public, allow_download, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [album.title, album.description, album.class_id, album.created_by, album.is_public, album.allow_download, album.tags]
    );
    console.log(`  ✅ Album '${album.title}' berhasil ditambahkan`);
  }
}

// Seed chat rooms
async function seedChatRooms(connection) {
  console.log('💬 Seeding chat rooms...');
  
  const chatRooms = [
    {
      name: 'Chat Kelas 1A',
      type: 'class_chat',
      class_id: 1,
      description: 'Ruang chat untuk kelas 1A',
      members: JSON.stringify([3, 6, 7]), // teacher1, student1, student2
      moderators: JSON.stringify([3]), // teacher1
      settings: JSON.stringify({
        allow_media: true,
        allow_stickers: true,
        moderation_enabled: true
      }),
      created_by: 3 // teacher1
    },
    {
      name: 'Channel Orang Tua',
      type: 'parent_channel',
      class_id: null,
      description: 'Channel komunikasi untuk orang tua siswa',
      members: JSON.stringify([2, 5]), // admin, parent1
      moderators: JSON.stringify([2]), // admin
      settings: JSON.stringify({
        allow_media: true,
        allow_stickers: false,
        moderation_enabled: true
      }),
      created_by: 2 // admin
    },
    {
      name: 'Ruang Guru',
      type: 'teacher_room',
      class_id: null,
      description: 'Ruang diskusi khusus guru',
      members: JSON.stringify([2, 3, 4]), // admin, teacher1, teacher2
      moderators: JSON.stringify([2]), // admin
      settings: JSON.stringify({
        allow_media: true,
        allow_stickers: true,
        moderation_enabled: false
      }),
      created_by: 2 // admin
    }
  ];
  
  for (const room of chatRooms) {
    await connection.execute(
      'INSERT INTO chat_rooms (name, type, class_id, description, members, moderators, settings, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [room.name, room.type, room.class_id, room.description, room.members, room.moderators, room.settings, room.created_by]
    );
    console.log(`  ✅ Chat room '${room.name}' berhasil ditambahkan`);
  }
}

// Force seed function (overwrites existing data)
async function forceSeedDatabase() {
  let connection;
  
  try {
    console.log('🌱 Memulai force seeding database...');
    console.log('⚠️  PERINGATAN: Ini akan menghapus semua data yang ada!');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Koneksi ke database berhasil');
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Truncate all tables
    const tables = [
      'user_chat_settings', 'messages', 'chat_rooms', 'photos', 'albums',
      'comments', 'posts', 'user_badges', 'badges', 'quiz_answers',
      'quiz_attempts', 'quiz_question_options', 'quiz_questions', 'quizzes',
      'event_bookings', 'events', 'classes', 'stickers', 'users'
    ];
    
    for (const table of tables) {
      await connection.execute(`TRUNCATE TABLE ${table}`);
      console.log(`  🗑️  Tabel '${table}' dikosongkan`);
    }
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Now seed the data
    await seedUsers(connection);
    await seedClasses(connection);
    await seedBadges(connection);
    await seedStickers(connection);
    await seedEvents(connection);
    await seedQuizzes(connection);
    await seedAlbums(connection);
    await seedChatRooms(connection);
    
    console.log('🎉 Force seeding database selesai!');
    
  } catch (error) {
    console.error('❌ Error saat force seeding database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Koneksi database ditutup');
    }
  }
}

// Run seeding if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const forceMode = args.includes('--force');
  
  const seedFunction = forceMode ? forceSeedDatabase : seedDatabase;
  
  seedFunction()
    .then(() => {
      console.log('🎉 Database seeding berhasil!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding gagal:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, forceSeedDatabase };
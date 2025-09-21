# 🗄️ Database Management - Seangkatan

Dokumentasi lengkap untuk mengelola database aplikasi Seangkatan.

## 📋 Daftar Isi

- [Persyaratan](#persyaratan)
- [Konfigurasi](#konfigurasi)
- [Script yang Tersedia](#script-yang-tersedia)
- [Cara Penggunaan](#cara-penggunaan)
- [Struktur Database](#struktur-database)
- [Data Sample](#data-sample)
- [Troubleshooting](#troubleshooting)

## 🔧 Persyaratan

- Node.js (v14 atau lebih baru)
- MySQL Server (v5.7 atau lebih baru)
- NPM packages yang sudah terinstall

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` di root directory dengan konfigurasi berikut:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=seangkatan_db

# Server Configuration
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

### Default Values

Jika environment variables tidak diset, akan menggunakan nilai default:
- `DB_HOST`: localhost
- `DB_USER`: root
- `DB_PASSWORD`: (kosong)
- `DB_NAME`: seangkatan_db

## 📁 Script yang Tersedia

### 1. `setup-database.js`
Script untuk membuat database dan semua tabel yang diperlukan.

### 2. `seed-database.js`
Script untuk mengisi database dengan data sample/default.

### 3. `migrate-database.js`
Script utama yang menggabungkan setup dan seeding dengan berbagai opsi.

## 🚀 Cara Penggunaan

### Setup Awal (Pertama Kali)

```bash
# Setup database dan tabel + insert data sample
node migrate-database.js migrate
```

### Command-Command Tersedia

#### 1. Setup Database dan Tabel Saja
```bash
node migrate-database.js setup
```

#### 2. Insert Data Sample Saja
```bash
# Insert data sample (akan dibatalkan jika sudah ada data)
node migrate-database.js seed

# Force insert data sample (menimpa data yang ada)
node migrate-database.js seed --force
```

#### 3. Migrasi Lengkap
```bash
# Setup + seed (normal)
node migrate-database.js migrate

# Setup + seed (force mode)
node migrate-database.js migrate --force
```

#### 4. Reset Database Lengkap
```bash
# Drop database, buat ulang, setup, dan seed
node migrate-database.js reset
```

#### 5. Cek Status Database
```bash
node migrate-database.js status
```

#### 6. Backup Database
```bash
# Backup dengan nama otomatis
node migrate-database.js backup

# Backup dengan nama custom
node migrate-database.js backup my-backup.sql
```

### Menjalankan Script Individual

#### Setup Database
```bash
node setup-database.js
```

#### Seed Database
```bash
# Normal seeding
node seed-database.js

# Force seeding (menimpa data yang ada)
node seed-database.js --force
```

## 🏗️ Struktur Database

### Tabel Utama

#### 1. `users`
Menyimpan data pengguna sistem
- Roles: owner, school_admin, teacher, parent, student
- Fields: username, email, password_hash, role, full_name, phone

#### 2. `classes`
Menyimpan data kelas
- Fields: name, grade_level, academic_year, teacher_id

#### 3. `events`
Menyimpan data acara/event
- Types: parent_meeting, class_competition
- Fields: title, description, event_date, location, max_participants

#### 4. `quizzes`
Menyimpan data quiz
- Categories: reading, writing, math, science
- Difficulties: easy, medium, hard

#### 5. `posts`
Menyimpan postingan siswa
- Types: artwork, assignment, project
- Status: draft, pending, approved, rejected

#### 6. `albums` & `photos`
Menyimpan album foto dan foto-foto

#### 7. `chat_rooms` & `messages`
Sistem chat/messaging

#### 8. `badges` & `user_badges`
Sistem badge/penghargaan

### Relasi Antar Tabel

```
users (1) -----> (N) classes (teacher_id)
users (1) -----> (N) events (created_by)
users (1) -----> (N) quizzes (created_by)
classes (1) ----> (N) events (class_id)
classes (1) ----> (N) quizzes (class_id)
quizzes (1) ----> (N) quiz_questions
quiz_questions (1) -> (N) quiz_question_options
users (1) -----> (N) quiz_attempts (student_id)
quiz_attempts (1) -> (N) quiz_answers
```

## 👥 Data Sample

### Users Default
- **owner**: owner@seangkatan.com (password: password123)
- **admin**: admin@seangkatan.com (password: password123)
- **teacher1**: teacher1@seangkatan.com (password: password123)
- **teacher2**: teacher2@seangkatan.com (password: password123)
- **parent1**: parent1@seangkatan.com (password: password123)
- **student1**: student1@seangkatan.com (password: password123)
- **student2**: student2@seangkatan.com (password: password123)

### Classes Default
- Kelas 1A (Grade 1, Teacher: teacher1)
- Kelas 1B (Grade 1, Teacher: teacher2)
- Kelas 2A (Grade 2, Teacher: teacher1)

### Badges Default
- Quiz Master (10 quiz dengan skor 80%+)
- Perfect Score (skor 100%)
- Math Genius (5 quiz math dengan skor 90%+)
- Reading Champion (5 quiz reading dengan skor 90%+)

### Chat Rooms Default
- Chat Kelas 1A (class_chat)
- Channel Orang Tua (parent_channel)
- Ruang Guru (teacher_room)

## 🔧 Troubleshooting

### Error: Database connection failed

**Penyebab**: Konfigurasi database salah atau MySQL server tidak berjalan

**Solusi**:
1. Pastikan MySQL server berjalan
2. Cek konfigurasi di file `.env`
3. Test koneksi manual ke MySQL

### Error: Access denied for user

**Penyebab**: Username/password MySQL salah

**Solusi**:
1. Cek username dan password di `.env`
2. Pastikan user MySQL memiliki privilege yang cukup

### Error: Table already exists

**Penyebab**: Tabel sudah ada di database

**Solusi**:
1. Gunakan `node migrate-database.js reset` untuk reset lengkap
2. Atau gunakan `--force` flag untuk menimpa data

### Error: Foreign key constraint fails

**Penyebab**: Urutan pembuatan tabel atau data tidak sesuai

**Solusi**:
1. Gunakan `node migrate-database.js reset`
2. Script sudah mengatur urutan yang benar

### Error: mysqldump command not found

**Penyebab**: MySQL client tools tidak terinstall atau tidak ada di PATH

**Solusi**:
1. Install MySQL client tools
2. Tambahkan MySQL bin directory ke PATH

## 📝 Tips Penggunaan

### Development
```bash
# Setup awal development
node migrate-database.js migrate

# Reset ketika ada perubahan struktur
node migrate-database.js reset
```

### Production
```bash
# Backup sebelum migrasi
node migrate-database.js backup

# Setup production (tanpa data sample)
node migrate-database.js setup
```

### Testing
```bash
# Reset untuk testing
node migrate-database.js reset

# Cek status setelah testing
node migrate-database.js status
```

## 🔒 Keamanan

- Jangan commit file `.env` ke repository
- Gunakan password yang kuat untuk database
- Backup database secara berkala
- Gunakan user database dengan privilege minimal yang diperlukan

## 📞 Support

Jika mengalami masalah:
1. Cek log error yang muncul
2. Pastikan semua persyaratan terpenuhi
3. Coba jalankan `node migrate-database.js status` untuk diagnosis
4. Reset database jika diperlukan dengan `node migrate-database.js reset`
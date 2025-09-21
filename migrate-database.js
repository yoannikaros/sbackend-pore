const mysql = require('mysql2/promise');
const { setupDatabase } = require('./setup-database');
const { seedDatabase, forceSeedDatabase } = require('./seed-database');
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

// Migration functions
async function runMigration(options = {}) {
  const {
    setup = true,
    seed = true,
    force = false,
    reset = false
  } = options;
  
  try {
    console.log('🚀 Memulai migrasi database...');
    console.log('📋 Opsi migrasi:', { setup, seed, force, reset });
    
    if (reset) {
      console.log('🔄 Mode reset: Menghapus dan membuat ulang database...');
      await resetDatabase();
    }
    
    if (setup) {
      console.log('🏗️  Menjalankan setup database...');
      await setupDatabase();
    }
    
    if (seed) {
      console.log('🌱 Menjalankan seeding database...');
      if (force) {
        await forceSeedDatabase();
      } else {
        await seedDatabase();
      }
    }
    
    console.log('🎉 Migrasi database berhasil!');
    
  } catch (error) {
    console.error('❌ Migrasi database gagal:', error.message);
    throw error;
  }
}

// Reset database (drop and recreate)
async function resetDatabase() {
  let connection;
  
  try {
    console.log('🔄 Mereset database...');
    
    // Connect without specifying database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    connection = await mysql.createConnection(tempConfig);
    console.log('✅ Koneksi ke MySQL berhasil');
    
    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS ${dbConfig.database}`);
    console.log(`🗑️  Database '${dbConfig.database}' berhasil dihapus`);
    
    // Create database
    await connection.execute(`CREATE DATABASE ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' berhasil dibuat ulang`);
    
  } catch (error) {
    console.error('❌ Error saat reset database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Check database status
async function checkDatabaseStatus() {
  let connection;
  
  try {
    console.log('🔍 Memeriksa status database...');
    
    // Try to connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Koneksi ke database berhasil');
    
    // Check if tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [dbConfig.database]);
    
    console.log(`📊 Database '${dbConfig.database}' memiliki ${tables.length} tabel:`);
    
    if (tables.length > 0) {
      // Check data in key tables
      const keyTables = ['users', 'classes', 'events', 'quizzes'];
      
      for (const tableName of keyTables) {
        const tableExists = tables.find(t => t.TABLE_NAME === tableName);
        if (tableExists) {
          const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`  📋 ${tableName}: ${rows[0].count} records`);
        }
      }
    } else {
      console.log('  ⚠️  Tidak ada tabel yang ditemukan');
    }
    
    return {
      connected: true,
      tablesCount: tables.length,
      tables: tables.map(t => t.TABLE_NAME)
    };
    
  } catch (error) {
    console.error('❌ Error saat memeriksa database:', error.message);
    return {
      connected: false,
      error: error.message
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Backup database
async function backupDatabase(outputFile) {
  const { spawn } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  
  return new Promise((resolve, reject) => {
    console.log('💾 Membuat backup database...');
    
    const backupPath = outputFile || `backup_${dbConfig.database}_${new Date().toISOString().slice(0, 10)}.sql`;
    
    const mysqldump = spawn('mysqldump', [
      '-h', dbConfig.host,
      '-u', dbConfig.user,
      ...(dbConfig.password ? ['-p' + dbConfig.password] : []),
      '--routines',
      '--triggers',
      dbConfig.database
    ]);
    
    const writeStream = fs.createWriteStream(backupPath);
    
    mysqldump.stdout.pipe(writeStream);
    
    mysqldump.stderr.on('data', (data) => {
      console.error('mysqldump error:', data.toString());
    });
    
    mysqldump.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Backup berhasil disimpan: ${backupPath}`);
        resolve(backupPath);
      } else {
        reject(new Error(`mysqldump exited with code ${code}`));
      }
    });
    
    mysqldump.on('error', (error) => {
      reject(error);
    });
  });
}

// CLI interface
async function runCLI() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'setup':
        await runMigration({ setup: true, seed: false });
        break;
        
      case 'seed':
        const forceFlag = args.includes('--force');
        await runMigration({ setup: false, seed: true, force: forceFlag });
        break;
        
      case 'migrate':
        const migrateForce = args.includes('--force');
        await runMigration({ setup: true, seed: true, force: migrateForce });
        break;
        
      case 'reset':
        await runMigration({ setup: true, seed: true, force: true, reset: true });
        break;
        
      case 'status':
        await checkDatabaseStatus();
        break;
        
      case 'backup':
        const outputFile = args[1];
        await backupDatabase(outputFile);
        break;
        
      default:
        console.log(`
🗄️  Database Migration Tool - Seangkatan

Penggunaan:
  node migrate-database.js <command> [options]

Commands:
  setup     - Hanya membuat database dan tabel
  seed      - Hanya insert data sample (gunakan --force untuk menimpa)
  migrate   - Setup + seed (gunakan --force untuk menimpa data)
  reset     - Drop database, buat ulang, setup, dan seed
  status    - Cek status database dan tabel
  backup    - Buat backup database (opsional: nama file)

Contoh:
  node migrate-database.js migrate
  node migrate-database.js seed --force
  node migrate-database.js reset
  node migrate-database.js backup my-backup.sql
        `);
        break;
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Command gagal:', error.message);
    process.exit(1);
  }
}

// Run CLI if called directly
if (require.main === module) {
  runCLI();
}

module.exports = {
  runMigration,
  resetDatabase,
  checkDatabaseStatus,
  backupDatabase
};
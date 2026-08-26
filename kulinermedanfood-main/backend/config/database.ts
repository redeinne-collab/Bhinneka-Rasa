import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Gunakan process.cwd() agar path selalu relatif terhadap
// working directory saat proses dijalankan (bukan lokasi file compiled).
// Di Railway: cwd = /app/backend (karena start command cd ke backend)
// Di local dev: cwd = folder backend juga (karena tsx dijalankan dari sana)
const dbPathEnv = process.env.DB_PATH || '.database/foodmap.db';

// Jika DB_PATH adalah absolute path, gunakan langsung.
// Jika relative, resolve dari cwd.
const resolvedDbPath = path.isAbsolute(dbPathEnv)
  ? dbPathEnv
  : path.resolve(process.cwd(), dbPathEnv);

// Pastikan direktori database ada (penting saat pertama kali deploy)
const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('✅ Database path resolved to:', resolvedDbPath);

// Inisialisasi database (better-sqlite3 akan membuat file baru jika belum ada)
const db = new Database(resolvedDbPath);

// Aktifkan foreign keys
db.exec('PRAGMA foreign_keys = ON');

export default db;
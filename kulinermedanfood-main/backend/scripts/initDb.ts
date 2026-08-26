import db, { sql } from '../config/database.js';

async function init() {
  await db.query(sql`CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, description TEXT, price REAL, image TEXT, category TEXT,
    is_popular INTEGER DEFAULT 0, history TEXT, journey TEXT, ingredients TEXT,
    spices TEXT, nutrition TEXT, cooking_steps TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_place_id TEXT UNIQUE, name TEXT NOT NULL, address TEXT,
    latitude REAL, longitude REAL, phone TEXT, website TEXT,
    rating REAL DEFAULT 0, total_reviews INTEGER DEFAULT 0,
    price_level TEXT, opening_hours TEXT, photos TEXT,
    dish_id INTEGER, dish_name TEXT, dish_history TEXT,
    dish_ingredients TEXT, dish_nutrition TEXT
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER, name TEXT, description TEXT, category TEXT,
    price REAL, rating REAL DEFAULT 0, total_ratings INTEGER DEFAULT 0,
    image_url TEXT, is_popular INTEGER DEFAULT 0, is_available INTEGER DEFAULT 1,
    is_vegetarian INTEGER DEFAULT 0, is_spicy INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER, user_id INTEGER DEFAULT 0, user_name TEXT,
    user_avatar TEXT, user_email TEXT, rating REAL, comment TEXT,
    images TEXT, visited_date TEXT, is_verified_purchase INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_type TEXT NOT NULL, question_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS quiz_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL, option_text TEXT NOT NULL,
    option_letter TEXT NOT NULL, food_target TEXT, is_correct INTEGER DEFAULT 0
  )`);

  await db.query(sql`CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, quiz_type TEXT,
    score INTEGER DEFAULT 0, result TEXT, food_result TEXT,
    total_score INTEGER DEFAULT 0, score_kb INTEGER DEFAULT 0,
    score_sm INTEGER DEFAULT 0, score_bm INTEGER DEFAULT 0,
    score_ba INTEGER DEFAULT 0, score_cf INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ Semua tabel berhasil dibuat!');
  await db.dispose();
}

init().catch(e => { console.error(e); process.exit(1); });

import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use persistent disk path on Render, otherwise use local path
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/data' 
  : join(__dirname, '../..');
const dbPath = join(DATA_DIR, 'database.sqlite');

let db;

// Admin credentials - change these as needed
const ADMIN_USERNAME = 'abbas123';
const ADMIN_EMAIL = 'admin@khanshamman.com';
const ADMIN_PASSWORD = 'khanshamman7';

export async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'sales')) NOT NULL,
      approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      wholesale_price REAL,
      stock_quantity INTEGER DEFAULT 0,
      image_url TEXT,
      category TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add wholesale_price column if it doesn't exist (for existing databases)
  try {
    db.run('ALTER TABLE products ADD COLUMN wholesale_price REAL');
  } catch (e) {
    // Column already exists, ignore
  }

  // Add category column if it doesn't exist (for existing databases)
  try {
    db.run('ALTER TABLE products ADD COLUMN category TEXT');
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_user_id INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT,
      client_phone TEXT,
      client_location TEXT,
      status TEXT CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered')) DEFAULT 'pending',
      total_amount REAL NOT NULL,
      notes TEXT,
      admin_notified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sales_user_id) REFERENCES users(id)
    )
  `);

  // Add client_location column if it doesn't exist (for existing databases)
  try {
    db.run('ALTER TABLE orders ADD COLUMN client_location TEXT');
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Seed admin account if it doesn't exist
  const adminExists = queryOne('SELECT id FROM users WHERE username = ? OR role = ?', [ADMIN_USERNAME, 'admin']);
  if (!adminExists) {
    const password_hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    db.run(
      'INSERT INTO users (username, email, password_hash, role, approved) VALUES (?, ?, ?, ?, 1)',
      [ADMIN_USERNAME, ADMIN_EMAIL, password_hash, 'admin']
    );
    console.log('Admin account created: ' + ADMIN_USERNAME);
  }

  saveDatabase();
  console.log('Database initialized');
  return db;
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export function getDb() {
  return db;
}

// Helper functions for sql.js (which returns arrays instead of objects)
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

export function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

export function run(sql, params = []) {
  db.run(sql, params);
  const lastIdResult = db.exec("SELECT last_insert_rowid() as id");
  const lastId = lastIdResult.length > 0 && lastIdResult[0].values.length > 0 
    ? lastIdResult[0].values[0][0] 
    : 0;
  const changes = db.getRowsModified();
  saveDatabase();
  return {
    lastInsertRowid: lastId,
    changes: changes
  };
}

export default { initDatabase, getDb, queryAll, queryOne, run, saveDatabase };

import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Admin credentials - change these as needed
const ADMIN_USERNAME = 'abbas123';
const ADMIN_EMAIL = 'admin@khanshamman.com';
const ADMIN_PASSWORD = 'khanshamman7';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK(role IN ('admin', 'sales')) NOT NULL,
        approved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        wholesale_price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        image_url TEXT,
        category VARCHAR(255),
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        sales_user_id INTEGER NOT NULL REFERENCES users(id),
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        client_phone VARCHAR(100),
        client_location TEXT,
        status VARCHAR(50) CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered')) DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        admin_notified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL
      )
    `);

    // Seed admin account if it doesn't exist
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE username = $1 OR role = $2',
      [ADMIN_USERNAME, 'admin']
    );
    
    if (adminCheck.rows.length === 0) {
      const password_hash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
      await client.query(
        'INSERT INTO users (username, email, password_hash, role, approved) VALUES ($1, $2, $3, $4, 1)',
        [ADMIN_USERNAME, ADMIN_EMAIL, password_hash, 'admin']
      );
      console.log('Admin account created: ' + ADMIN_USERNAME);
    }

    console.log('Database initialized');
  } finally {
    client.release();
  }
}

// Helper functions compatible with the existing codebase
export async function queryAll(sql, params = []) {
  // Convert ? placeholders to $1, $2, etc. for PostgreSQL
  let paramIndex = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
  const result = await pool.query(pgSql, params);
  return result.rows;
}

export async function queryOne(sql, params = []) {
  const results = await queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function run(sql, params = []) {
  // Convert ? placeholders to $1, $2, etc. for PostgreSQL
  let paramIndex = 0;
  const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`);
  
  // Check if this is an INSERT statement and add RETURNING id
  const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
  const finalSql = isInsert && !pgSql.toUpperCase().includes('RETURNING') 
    ? `${pgSql} RETURNING id` 
    : pgSql;
  
  const result = await pool.query(finalSql, params);
  
  return {
    lastInsertRowid: result.rows[0]?.id || 0,
    changes: result.rowCount
  };
}

// No-op for compatibility (PostgreSQL auto-persists)
export function saveDatabase() {}

export function getDb() {
  return pool;
}

export default { initDatabase, getDb, queryAll, queryOne, run, saveDatabase };

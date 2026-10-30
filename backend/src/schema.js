import { query } from './db.js';

export async function initSchema() {
  console.log('[DB] Verifying and initializing database schema...');

  // 1. Admins Table
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Site Settings Table
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 3. Categories Table
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_ur TEXT NOT NULL,
      description_en TEXT DEFAULT '',
      description_ur TEXT DEFAULT '',
      icon TEXT DEFAULT 'Layers',
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 4. Products Table
  await query(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      sku TEXT DEFAULT '',
      name_en TEXT NOT NULL,
      name_ur TEXT NOT NULL,
      description_en TEXT DEFAULT '',
      description_ur TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      price REAL DEFAULT 0,
      is_price_on_request INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'Piece',
      variants_json TEXT DEFAULT '[]',
      is_available INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 5. Orders Table
  await query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      shop_name TEXT DEFAULT '',
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'New',
      total_items INTEGER DEFAULT 0,
      estimated_total REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 6. Order Items Table
  await query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name_en TEXT NOT NULL,
      product_name_ur TEXT NOT NULL,
      variant TEXT DEFAULT '',
      unit TEXT DEFAULT 'Piece',
      quantity INTEGER NOT NULL,
      unit_price REAL DEFAULT 0,
      is_price_on_request INTEGER DEFAULT 0,
      line_total REAL DEFAULT 0
    );
  `);

  console.log('[DB] Schema initialized successfully.');
}

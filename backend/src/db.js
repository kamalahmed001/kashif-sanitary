import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.TURSO_DATABASE_URL || 'file:kashif_sanitary.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

console.log(`[DB] Initializing database connection...`);
if (process.env.TURSO_DATABASE_URL) {
  console.log(`[DB] Using remote Turso Database at: ${process.env.TURSO_DATABASE_URL}`);
} else {
  console.log(`[DB] No TURSO_DATABASE_URL found, using local fallback database (kashif_sanitary.db)`);
}

export const db = createClient({
  url,
  authToken,
});

/**
 * Helper to run queries easily with parameter mapping
 */
export async function query(sql, args = []) {
  try {
    return await db.execute({ sql, args });
  } catch (error) {
    console.error(`[DB Error] query failed: "${sql}"`, error);
    throw error;
  }
}

export async function executeMultiple(statements) {
  try {
    return await db.batch(statements, 'write');
  } catch (error) {
    console.error(`[DB Error] batch failed:`, error);
    throw error;
  }
}

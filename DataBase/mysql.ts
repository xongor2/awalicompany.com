import mysql from 'mysql2/promise';

/**
 * MySQL Connection Pool Configuration
 * Reads credentials from environment variables or defaults for local setup.
 */
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aw_ali_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

export function assertDatabaseConfiguration(): void {
  if (process.env.NODE_ENV !== 'production') return;
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const;
  const missing = required.filter(key => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Missing required MySQL environment variables: ${missing.join(', ')}`);
  }
}

let pool: mysql.Pool | null = null;
let isConnected = false;

/**
 * Get or initialize MySQL Connection Pool
 */
export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Check if MySQL server is reachable
 */
export async function testMySQLConnection(): Promise<boolean> {
  try {
    const p = getMySQLPool();
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log('[DataBase] Successfully connected to MySQL database:', dbConfig.database);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn('[DataBase] MySQL is not connected or reachable.');
    return false;
  }
}

/**
 * Execute raw MySQL query safely
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const p = getMySQLPool();
  const [results] = await p.execute(sql, params);
  return results as T;
}

export function isMySQLActive(): boolean {
  return isConnected;
}

export default {
  getMySQLPool,
  testMySQLConnection,
  query,
  isMySQLActive,
  dbConfig,
};

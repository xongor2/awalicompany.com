import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { dbConfig } from './mysql.ts';

/**
 * Migration Script to apply schema.sql and seeds.sql to MySQL
 */
export async function runMigrations() {
  console.log('[DataBase/Migrate] Starting MySQL migrations...');
  
  const adminConnection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  try {
    const schemaPath = path.join(process.cwd(), 'DataBase', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      console.log('[DataBase/Migrate] Applying production schema...');
      await adminConnection.query(schemaSql);
      console.log('[DataBase/Migrate] Schema applied successfully.');
    }

    const seedsPath = path.join(process.cwd(), 'DataBase', 'seeds.sql');
    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, 'utf-8');
      console.log('[DataBase/Migrate] Applying seeds.sql...');
      await adminConnection.query(seedsSql);
      console.log('[DataBase/Migrate] Seeds applied successfully.');
    }
  } catch (err) {
    console.error('[DataBase/Migrate] Error running migrations:', err);
    throw err;
  } finally {
    await adminConnection.end();
  }
}

if (process.argv.includes('--run')) {
  runMigrations()
    .then(() => {
      console.log('[DataBase/Migrate] All migrations completed.');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

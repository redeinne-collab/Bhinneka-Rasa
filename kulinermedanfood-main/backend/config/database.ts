import createDatabase, { sql } from '@databases/sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPathEnv = process.env.DB_PATH || '.database/foodmap.db';
const resolvedDbPath = path.isAbsolute(dbPathEnv)
  ? dbPathEnv
  : path.resolve(process.cwd(), dbPathEnv);

const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('✅ Database path resolved to:', resolvedDbPath);

const db = createDatabase(resolvedDbPath);

export { sql };
export default db;

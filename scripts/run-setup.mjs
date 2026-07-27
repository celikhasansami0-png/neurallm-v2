import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'setup-db.sql'), 'utf8');

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_wHafF10bptis@ep-damp-boat-axoh6rog-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('Connecting to Neon...');
  await pool.query(sql);
  console.log('✓ Database setup complete! Tables created.');
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await pool.end();
}

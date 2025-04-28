import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Check if DATABASE_URL is defined in environment variables
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xzTpcRQeu53r@ep-rapid-grass-a59kwmg5-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';
console.log('Database URL:', databaseUrl ? 'Found' : 'Not found');

if (!databaseUrl) {
  throw new Error('DATABASE_URL env var is not defined');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = drizzle(pool);

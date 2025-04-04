import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true;

// Check if DATABASE_URL is defined in environment variables
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xzTpcRQeu53r@ep-rapid-grass-a59kwmg5-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';
console.log('Database URL:', databaseUrl ? 'Found' : 'Not found');

if (!databaseUrl) {
  throw new Error('DATABASE_URL env var is not defined');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);

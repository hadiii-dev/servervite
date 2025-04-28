import { db } from '../db';
import { sql } from 'drizzle-orm';

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    const result = await db.execute(sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    console.log('Database structure:');
    console.log(result.rows);
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  }
}

// Run the check
checkTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  }); 
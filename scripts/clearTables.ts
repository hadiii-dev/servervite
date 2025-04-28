import { db } from '../db';
import { sql } from 'drizzle-orm';

async function clearTables() {
  try {
    console.log('Clearing occupation_skill_relations table...');
    
    await db.execute(sql`TRUNCATE TABLE occupation_skill_relations CASCADE`);
    
    console.log('Table cleared successfully!');
  } catch (error) {
    console.error('Error clearing table:', error);
    throw error;
  }
}

// Run the clear
clearTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Clear failed:', error);
    process.exit(1);
  }); 
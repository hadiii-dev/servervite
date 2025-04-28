import { db } from '../db';
import { sql } from 'drizzle-orm';

async function createNewRelationsTable() {
  try {
    console.log('Creating new relations table...');
    
    // Create new table without foreign key constraints
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS occupation_skill_relations_new (
        id SERIAL PRIMARY KEY,
        occupation_uri TEXT NOT NULL,
        skill_uri TEXT NOT NULL,
        relation_type TEXT,
        skill_type TEXT,
        UNIQUE(occupation_uri, skill_uri)
      )
    `);
    
    console.log('New relations table created successfully!');
  } catch (error) {
    console.error('Error creating new table:', error);
    throw error;
  }
}

// Run the creation
createNewRelationsTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Creation failed:', error);
    process.exit(1);
  }); 
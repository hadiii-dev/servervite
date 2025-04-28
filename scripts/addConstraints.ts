import { db } from '../db';
import { sql } from 'drizzle-orm';

async function addConstraints() {
  try {
    console.log('Adding unique constraints...');

    // Add unique constraint to isco_groups.code
    await db.execute(sql`
      ALTER TABLE isco_groups
      ADD CONSTRAINT isco_groups_code_key UNIQUE (code);
    `);

    // Add unique constraint to skills.title
    await db.execute(sql`
      ALTER TABLE skills
      ADD CONSTRAINT skills_title_key UNIQUE (title);
    `);

    // Add unique constraint to occupation_skills
    await db.execute(sql`
      ALTER TABLE occupation_skills
      ADD CONSTRAINT occupation_skills_occupation_skill_key UNIQUE (occupation_id, skill_id);
    `);

    console.log('Constraints added successfully!');
  } catch (error) {
    console.error('Error adding constraints:', error);
    throw error;
  }
}

// Run the migration
addConstraints()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

async function importSkills() {
  try {
    // Read and parse skills CSV file
    const skillsData = parse(readFileSync(join(__dirname, '../skills_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    });

    console.log('Starting skills import...');
    console.log(`Found ${skillsData.length} skills to import`);

    // Import skills
    console.log('Importing skills...');
    for (const skill of skillsData) {
      try {
        await db.execute(sql`
          INSERT INTO skills (
            title,
            description,
            created_at,
            updated_at
          ) VALUES (
            ${skill.preferredLabel || ''},
            ${skill.description || null},
            NOW(),
            NOW()
          )
          ON CONFLICT (title) DO UPDATE SET
            description = EXCLUDED.description,
            updated_at = NOW()
        `);
      } catch (error) {
        console.error(`Error importing skill: ${skill.preferredLabel}`, error);
        throw error;
      }
    }

    console.log('Skills import completed successfully!');
  } catch (error) {
    console.error('Error during skills import:', error);
    throw error;
  }
}

// Run the import
importSkills()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 
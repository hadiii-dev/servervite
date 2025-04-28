import { db } from '../db';
import { sql } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

async function importESOData() {
  try {
    // Read and parse CSV files
    const occupationsData = parse(readFileSync(join(__dirname, '../occupations_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    });

    const skillsData = parse(readFileSync(join(__dirname, '../skills_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    });

    const relationsData = parse(readFileSync(join(__dirname, '../occupationSkillRelations_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    });

    const iscoGroupsData = parse(readFileSync(join(__dirname, '../ISCOGroups_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    });

    console.log('Starting data import...');

    // Import ISCO groups first
    console.log('Importing ISCO groups...');
    for (const group of iscoGroupsData) {
      await db.execute(sql`
        INSERT INTO isco_groups (
          code,
          title,
          description,
          created_at,
          updated_at
        ) VALUES (
          ${group.conceptUri?.split('/').pop() || null},
          ${group.preferredLabel || ''},
          ${group.description || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (code) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
      `);
    }

    // Import occupations
    console.log('Importing occupations...');
    for (const occupation of occupationsData) {
      await db.execute(sql`
        INSERT INTO esco_occupations (
          id,
          isco_group_id,
          code,
          title,
          description,
          created_at,
          updated_at
        ) VALUES (
          ${occupation.conceptUri},
          (SELECT id FROM isco_groups WHERE code = ${occupation.iscoGroup?.split('/').pop() || null}),
          ${occupation.code || null},
          ${occupation.preferredLabel || ''},
          ${occupation.description || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
      `);
    }

    // Import skills
    console.log('Importing skills...');
    for (const skill of skillsData) {
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
    }

    // Import occupation-skill relations
    console.log('Importing occupation-skill relations...');
    for (const relation of relationsData) {
      await db.execute(sql`
        INSERT INTO occupation_skills (
          occupation_id,
          skill_id,
          created_at
        ) VALUES (
          ${relation.occupationUri},
          (SELECT id FROM skills WHERE title = ${relation.skillUri}),
          NOW()
        )
        ON CONFLICT (occupation_id, skill_id) DO NOTHING
      `);
    }

    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error during data import:', error);
    throw error;
  }
}

// Run the import
importESOData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 
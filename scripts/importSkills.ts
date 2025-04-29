import { db } from '../db';
import { sql } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

async function importSkillsNew() {
  try {
    // Read and parse skills CSV file
    const skillsData = parse(
      readFileSync(join(__dirname, '../skills_en.csv')),
      {
        columns: true,
        skip_empty_lines: true,
      }
    );

    console.log('Starting skills import into skillsNew...');
    console.log(`Found ${skillsData.length} skills to import`);

    let successCount = 0;
    let errorCount = 0;

    for (const skill of skillsData) {
      try {
        await db.execute(sql`
          INSERT INTO skillsNew (
            concept_type,
            concept_uri,
            skill_type,
            reuse_level,
            preferred_label,
            alt_labels,
            hidden_labels,
            status,
            modified_date,
            scope_note,
            definition,
            in_scheme,
            description
          ) VALUES (
            ${skill.conceptType},
            ${skill.conceptUri},
            ${skill.skillType || null},
            ${skill.reuseLevel || null},
            ${skill.preferredLabel || ''},
            ${skill.altLabels || null},
            ${skill.hiddenLabels || null},
            ${skill.status || null},
            ${skill.modifiedDate || null},
            ${skill.scopeNote || null},
            ${skill.definition || null},
            ${skill.inScheme || null},
            ${skill.description || null}
          )
          ON CONFLICT (concept_uri) DO NOTHING
        `);
        successCount++;
      } catch (error) {
        console.error(`Error importing skill: ${skill.conceptUri}`, error);
        errorCount++;
      }
    }

    console.log(`Skills import completed!`);
    console.log(`Successfully imported: ${successCount} skills`);
    console.log(`Failed to import: ${errorCount} skills`);
  } catch (error) {
    console.error('Error during skills import:', error);
    throw error;
  }
}

// Run the import
importSkillsNew()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });

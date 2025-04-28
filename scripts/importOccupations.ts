import { db } from '../db';
import { sql } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

async function importOccupations() {
  try {
    // Read and parse occupations CSV file
    const occupationsData = parse(readFileSync(join(__dirname, '../occupations_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    });

    console.log('Starting occupations import...');
    console.log(`Found ${occupationsData.length} occupations to import`);

    // Import occupations
    console.log('Importing occupations...');
    let successCount = 0;
    let errorCount = 0;

    for (const occupation of occupationsData) {
      try {
        await db.execute(sql`
          INSERT INTO occupations (
            concept_uri,
            concept_type,
            isco_group,
            preferred_label,
            alt_labels,
            status,
            modified_date,
            regulated_profession_note,
            scope_note,
            definition,
            in_scheme,
            description,
            code
          ) VALUES (
            ${occupation.conceptUri},
            ${occupation.conceptType || null},
            ${occupation.iscoGroup || null},
            ${occupation.preferredLabel || ''},
            ${occupation.altLabels || null},
            ${occupation.status || null},
            ${occupation.modifiedDate || null},
            ${occupation.regulatedProfessionNote || null},
            ${occupation.scopeNote || null},
            ${occupation.definition || null},
            ${occupation.inScheme || null},
            ${occupation.description || null},
            ${occupation.code || null}
          )
          ON CONFLICT (concept_uri) DO NOTHING
        `);
        successCount++;
      } catch (error) {
        console.error(`Error importing occupation: ${occupation.conceptUri}`, error);
        errorCount++;
      }
    }

    console.log(`Occupations import completed!`);
    console.log(`Successfully imported: ${successCount} occupations`);
    console.log(`Failed to import: ${errorCount} occupations`);
  } catch (error) {
    console.error('Error during occupations import:', error);
    throw error;
  }
}

// Run the import
importOccupations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 
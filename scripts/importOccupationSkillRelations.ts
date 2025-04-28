import { db } from '../db';
import { sql } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Relation {
  occupationUri: string;
  skillUri: string;
  relationType?: string;
  skillType?: string;
}

async function importOccupationSkillRelations() {
  try {
    // Read and parse relations CSV file
    const relationsData = parse(readFileSync(join(__dirname, '../occupationSkillRelations_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    }) as Relation[];

    console.log('Starting occupation-skill relations import...');
    console.log(`Found ${relationsData.length} relations to import`);

    // Get the last successfully imported relation
    const lastImported = await db.execute(sql`
      SELECT occupation_uri, skill_uri 
      FROM occupation_skill_relations_new 
      ORDER BY id DESC 
      LIMIT 1
    `);

    let startIndex = 0;
    if (lastImported.rows.length > 0) {
      const lastUri = lastImported.rows[0].occupation_uri;
      startIndex = relationsData.findIndex(r => r.occupationUri === lastUri) + 1;
      console.log(`Resuming from index ${startIndex}`);
    }

    // Import relations
    console.log('Importing relations...');
    let successCount = 0;
    let errorCount = 0;
    let batchSize = 100; // Reduced batch size for better stability

    for (let i = startIndex; i < relationsData.length; i += batchSize) {
      const batch = relationsData.slice(i, i + batchSize);
      const values = batch.map(r => sql`(
        ${r.occupationUri},
        ${r.skillUri},
        ${r.relationType || null},
        ${r.skillType || null}
      )`);

      try {
        await db.execute(sql`
          INSERT INTO occupation_skill_relations_new (
            occupation_uri,
            skill_uri,
            relation_type,
            skill_type
          ) VALUES ${sql.join(values, sql`, `)}
          ON CONFLICT (occupation_uri, skill_uri) DO NOTHING
        `);
        successCount += batch.length;
        console.log(`Processed ${i + batch.length} of ${relationsData.length} relations`);
      } catch (error) {
        console.error(`Error importing batch at index ${i}:`, error);
        errorCount += batch.length;
        
        // If batch fails, try individual inserts
        for (const r of batch) {
          try {
            await db.execute(sql`
              INSERT INTO occupation_skill_relations_new (
                occupation_uri,
                skill_uri,
                relation_type,
                skill_type
              ) VALUES (
                ${r.occupationUri},
                ${r.skillUri},
                ${r.relationType || null},
                ${r.skillType || null}
              )
              ON CONFLICT (occupation_uri, skill_uri) DO NOTHING
            `);
            successCount++;
            errorCount--;
          } catch (e) {
            console.error(`Error importing relation: ${r.occupationUri} - ${r.skillUri}`, e);
          }
        }
      }
    }

    console.log(`Occupation-skill relations import completed!`);
    console.log(`Successfully imported: ${successCount} relations`);
    console.log(`Failed to import: ${errorCount} relations`);
  } catch (error) {
    console.error('Error during relations import:', error);
    throw error;
  }
}

// Run the import
importOccupationSkillRelations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  }); 
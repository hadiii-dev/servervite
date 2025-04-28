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

async function checkMissingRelations() {
  try {
    // Read and parse relations CSV file
    const relationsData = parse(readFileSync(join(__dirname, '../occupationSkillRelations_en.csv')), {
      columns: true,
      skip_empty_lines: true,
    }) as Relation[];

    console.log('Starting missing relations check...');
    console.log(`Total relations in CSV: ${relationsData.length}`);

    // Get all relations from database
    const dbRelations = await db.execute(sql`
      SELECT occupation_uri, skill_uri 
      FROM occupation_skill_relations_new
    `);

    console.log(`Total relations in database: ${dbRelations.rows.length}`);

    // Create a Set of existing relations for faster lookup
    const existingRelations = new Set(
      dbRelations.rows.map(r => `${r.occupation_uri}-${r.skill_uri}`)
    );

    // Find missing relations
    const missingRelations = relationsData.filter(
      r => !existingRelations.has(`${r.occupationUri}-${r.skillUri}`)
    );

    console.log(`\nMissing relations: ${missingRelations.length}`);
    
    if (missingRelations.length > 0) {
      console.log('\nFirst 10 missing relations:');
      missingRelations.slice(0, 10).forEach(r => {
        console.log(`Occupation: ${r.occupationUri}`);
        console.log(`Skill: ${r.skillUri}`);
        console.log('---');
      });

      // Save missing relations to a file
      const missingData = missingRelations.map(r => ({
        occupationUri: r.occupationUri,
        skillUri: r.skillUri,
        relationType: r.relationType,
        skillType: r.skillType
      }));

      const fs = require('fs');
      fs.writeFileSync(
        join(__dirname, '../missing_relations.json'),
        JSON.stringify(missingData, null, 2)
      );
      console.log('\nFull list of missing relations saved to missing_relations.json');
    }

  } catch (error) {
    console.error('Error checking missing relations:', error);
    throw error;
  }
}

// Run the check
checkMissingRelations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  }); 
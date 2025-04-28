import { db } from '../db';
import { sql } from 'drizzle-orm';

async function createTables() {
  try {
    // Create tables first
    console.log('Creating tables...');
    
    console.log('Creating occupations table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS occupations (
        id SERIAL PRIMARY KEY,
        concept_type TEXT,
        concept_uri TEXT UNIQUE,
        isco_group TEXT,
        preferred_label TEXT NOT NULL,
        alt_labels TEXT,
        status TEXT,
        modified_date TIMESTAMP,
        regulated_profession_note TEXT,
        scope_note TEXT,
        definition TEXT,
        in_scheme TEXT,
        description TEXT,
        code TEXT
      )
    `);

    console.log('Creating ISCO groups table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS isco_groups (
        id SERIAL PRIMARY KEY,
        concept_uri TEXT UNIQUE,
        preferred_label TEXT NOT NULL,
        alt_labels TEXT,
        status TEXT,
        modified_date TIMESTAMP,
        scope_note TEXT,
        definition TEXT,
        in_scheme TEXT,
        description TEXT
      )
    `);

    console.log('Creating skills table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        concept_type TEXT,
        concept_uri TEXT UNIQUE,
        skill_type TEXT,
        reuse_level TEXT,
        preferred_label TEXT NOT NULL,
        alt_labels TEXT,
        status TEXT,
        modified_date TIMESTAMP,
        scope_note TEXT,
        definition TEXT,
        in_scheme TEXT,
        description TEXT
      )
    `);

    console.log('Creating occupation_skill_relations table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS occupation_skill_relations (
        id SERIAL PRIMARY KEY,
        occupation_uri TEXT NOT NULL,
        skill_uri TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        skill_type TEXT NOT NULL
      )
    `);

    // Add foreign key constraints
    console.log('Adding foreign key constraints...');
    
    try {
      await db.execute(sql`
        ALTER TABLE occupation_skill_relations 
        ADD CONSTRAINT fk_occupation_uri 
        FOREIGN KEY (occupation_uri) 
        REFERENCES occupations(concept_uri)
      `);
    } catch (error) {
      console.warn('Failed to add foreign key constraint fk_occupation_uri:', error);
    }

    try {
      await db.execute(sql`
        ALTER TABLE occupation_skill_relations 
        ADD CONSTRAINT fk_skill_uri 
        FOREIGN KEY (skill_uri) 
        REFERENCES skills(concept_uri)
      `);
    } catch (error) {
      console.warn('Failed to add foreign key constraint fk_skill_uri:', error);
    }

    // Create indexes after tables are created
    console.log('Creating indexes...');
    
    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS occupations_preferred_label_idx ON occupations (preferred_label)
      `);
    } catch (error) {
      console.warn('Failed to create index occupations_preferred_label_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS occupations_alt_labels_idx ON occupations (alt_labels)
      `);
    } catch (error) {
      console.warn('Failed to create index occupations_alt_labels_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS occupations_isco_group_idx ON occupations (isco_group)
      `);
    } catch (error) {
      console.warn('Failed to create index occupations_isco_group_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS isco_groups_preferred_label_idx ON isco_groups (preferred_label)
      `);
    } catch (error) {
      console.warn('Failed to create index isco_groups_preferred_label_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS skills_preferred_label_idx ON skills (preferred_label)
      `);
    } catch (error) {
      console.warn('Failed to create index skills_preferred_label_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS skills_skill_type_idx ON skills (skill_type)
      `);
    } catch (error) {
      console.warn('Failed to create index skills_skill_type_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS occupation_skill_idx ON occupation_skill_relations (occupation_uri, skill_uri)
      `);
    } catch (error) {
      console.warn('Failed to create index occupation_skill_idx:', error);
    }

    try {
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS occupation_skill_relation_type_idx ON occupation_skill_relations (relation_type)
      `);
    } catch (error) {
      console.warn('Failed to create index occupation_skill_relation_type_idx:', error);
    }

    console.log('Tables, constraints, and indexes created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Run the migration
createTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 
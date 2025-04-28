import { Router } from 'express';

import { sql } from 'drizzle-orm';
import { db } from '../../db';

const router = Router();

// Get all ISCO groups
router.get('/isco-groups', async (req, res) => {
  try {
    const groups = await db.execute(sql`
      SELECT * FROM isco_groups
      ORDER BY code
    `);
    res.json(groups.rows);
  } catch (error) {
    console.error('Error fetching ISCO groups:', error);
    res.status(500).json({ error: 'Failed to fetch ISCO groups' });
  }
});

// Get all ESCO occupations
router.get('/esco-occupations', async (req, res) => {
  try {
    const occupations = await db.execute(sql`
      SELECT * FROM esco_occupations
      ORDER BY code
    `);
    res.json(occupations.rows);
  } catch (error) {
    console.error('Error fetching ESCO occupations:', error);
    res.status(500).json({ error: 'Failed to fetch ESCO occupations' });
  }
});

// Get all skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await db.execute(sql`
      SELECT * FROM skills
      ORDER BY title
    `);
    res.json(skills.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Get all occupation-skill relations
router.get('/occupation-skill-relations', async (req, res) => {
  try {
    const relations = await db.execute(sql`
      SELECT * FROM occupation_skill_relations_new
      ORDER BY occupation_uri, skill_uri
    `);
    res.json(relations.rows);
  } catch (error) {
    console.error('Error fetching occupation-skill relations:', error);
    res.status(500).json({ error: 'Failed to fetch occupation-skill relations' });
  }
});

// Get occupation with its skills
router.get('/occupations/:uri/skills', async (req, res) => {
  try {
    const { uri } = req.params;
    
    // Get occupation details
    const occupation = await db.execute(sql`
      SELECT * FROM occupations
      WHERE concept_uri = ${uri}
    `);

    if (!occupation.rows.length) {
      return res.status(404).json({ error: 'Occupation not found' });
    }

    // Get related skills
    const skills = await db.execute(sql`
      SELECT s.* 
      FROM skills s
      JOIN occupation_skill_relations_new osr ON s.uri = osr.skill_uri
      WHERE osr.occupation_uri = ${uri}
      ORDER BY s.title
    `);

    res.json({
      occupation: occupation.rows[0],
      skills: skills.rows
    });
  } catch (error) {
    console.error('Error fetching occupation skills:', error);
    res.status(500).json({ error: 'Failed to fetch occupation skills' });
  }
});

// Get skill with related occupations
router.get('/skills/:uri/occupations', async (req, res) => {
  try {
    const { uri } = req.params;
    
    // Get skill details
    const skill = await db.execute(sql`
      SELECT * FROM skills
      WHERE uri = ${uri}
    `);

    if (!skill.rows.length) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Get related occupations
    const occupations = await db.execute(sql`
      SELECT o.* 
      FROM occupations o
      JOIN occupation_skill_relations_new osr ON o.concept_uri = osr.occupation_uri
      WHERE osr.skill_uri = ${uri}
      ORDER BY o.preferred_label
    `);

    res.json({
      skill: skill.rows[0],
      occupations: occupations.rows
    });
  } catch (error) {
    console.error('Error fetching skill occupations:', error);
    res.status(500).json({ error: 'Failed to fetch skill occupations' });
  }
});

export default router; 
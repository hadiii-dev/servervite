import { Router } from 'express';
import { z } from 'zod';
import { syncJobsFromXML } from '../utils/jobSync';

const router = Router();

// Endpoint para sincronizar trabajos manualmente desde una URL XML
router.post('/sync-jobs', async (req, res) => {
  try {
    const schema = z.object({
      xmlUrl: z.string().url().optional()
    });
    
    const { xmlUrl } = schema.parse(req.body);
    
    const result = await syncJobsFromXML(xmlUrl);
    
    res.json({
      success: true,
      message: `Sync completed. Processed ${result.jobsProcessed} jobs, added ${result.newJobs} new jobs.`
    });
  } catch (error) {
    console.error('Error syncing jobs:', error);
    res.status(500).json({ error: "Failed to sync jobs" });
  }
});

export default router;
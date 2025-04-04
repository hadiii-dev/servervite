import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';

const router = Router();

// Todas las rutas son públicas ya que son para usuarios anónimos
router.post('/session', sessionController.createSession);
router.get('/session/:sessionId', sessionController.getSession);
router.patch('/session/:sessionId', sessionController.updateSession);
router.post('/session/:sessionId/job-action', sessionController.recordSessionJobAction);
router.get('/session/:sessionId/liked-jobs', sessionController.getSessionLikedJobs);

export default router;
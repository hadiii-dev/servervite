import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authenticateJWT, optionalAuthenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas o con autenticación opcional
router.get('/jobs', optionalAuthenticateJWT, jobController.getJobs);
router.get('/jobs/:id', optionalAuthenticateJWT, jobController.getJobById);

// Rutas que requieren autenticación
router.post('/user-jobs', authenticateJWT, jobController.recordUserJobAction);
router.get('/users/:userId/saved-jobs', authenticateJWT, jobController.getUserSavedJobs);
router.get('/users/:userId/applied-jobs', authenticateJWT, jobController.getUserAppliedJobs);

export default router;
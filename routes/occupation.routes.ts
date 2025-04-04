import { Router } from 'express';
import { 
  getOccupations,
  getOccupationById,
  createOccupation,
  importOccupationsFromCSV,
  getUserOccupations,
  createUserOccupation 
} from '../controllers/occupation.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas
router.get('/occupations', getOccupations);
router.get('/occupations/:id', getOccupationById);

// Rutas protegidas
router.post('/occupations', authenticateJWT, createOccupation);
router.post('/import-occupations', authenticateJWT, importOccupationsFromCSV);
router.get('/users/:userId/occupations', authenticateJWT, getUserOccupations);
router.post('/user-occupations', authenticateJWT, createUserOccupation);

export default router;
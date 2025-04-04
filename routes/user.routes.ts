import { Router } from 'express';
import { getUserById, getUserProfile, updateUserProfile } from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Ruta para obtener un usuario por ID (protegida)
router.get('/users/:userId', authenticateJWT, getUserById);

// Ruta para obtener el perfil de un usuario (protegida)
router.get('/users/:userId/profile', authenticateJWT, getUserProfile);

// Ruta para actualizar el perfil de un usuario (protegida)
router.patch('/users/:userId/profile', authenticateJWT, updateUserProfile);

export default router;
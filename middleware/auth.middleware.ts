import { Request, Response, NextFunction } from 'express';
import { authService, JwtPayload } from '../services/auth.service';
import { userService } from '../services/user.service';

// Extender Request para incluir el usuario autenticado
import { User } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware para verificar la autenticación JWT
 * Si el token es válido, añade el usuario a req.user y continúa
 * Si no, devuelve un error 401
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token de Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    // Buscar el usuario por id (asegurando que el sub es un número)
    const userId = typeof decoded.sub === 'number' ? decoded.sub : parseInt(decoded.sub as string, 10);
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Añadir el usuario a la request
    req.user = user;
    
    // Continuar
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

/**
 * Middleware opcional que verifica la autenticación si el token está presente,
 * pero permite continuar si no hay token (para endpoints que funcionan con y sin autenticación)
 */
export const optionalAuthenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token de Authorization header
    const authHeader = req.headers.authorization;
    
    // Si no hay token, continuar sin autenticación
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = authService.verifyToken(token);
    
    // Si el token no es válido, continuar sin autenticación
    if (!decoded) {
      return next();
    }

    // Buscar el usuario por id (asegurando que el sub es un número)
    const userId = typeof decoded.sub === 'number' ? decoded.sub : parseInt(decoded.sub as string, 10);
    const user = await userService.getUserById(userId);
    
    // Si se encuentra el usuario, añadirlo a la request
    if (user) {
      req.user = user;
    }
    
    // Continuar
    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    console.error('Error en autenticación opcional:', error);
    next();
  }
};
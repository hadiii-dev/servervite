import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { authService, JwtPayload } from '../services/auth.service';
import { BadRequestError, UnauthorizedError, ValidationError } from '../middleware/error.middleware';
import { insertUserSchema } from '../schemas';
import { z } from 'zod';

// Schema para validar login
const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Schema para validar refresh token
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido')
});

/**
 * Controlador para manejar el registro de usuarios
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar datos de entrada con el schema
    const validatedData = insertUserSchema.parse(req.body);
    
    // Verificar si el usuario ya existe
    const existingUser = await userService.getUserByUsername(validatedData.username);
    
    if (existingUser) {
      throw new ValidationError('El nombre de usuario ya está en uso');
    }
    
    // Crear el usuario (userService se encarga de hashear la contraseña)
    const user = await userService.createUser(validatedData);
    
    // Generar tokens
    const token = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    
    // Devolver respuesta sin incluir la contraseña
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    // Pasar el error al middleware de errores
    next(error);
  }
};

/**
 * Controlador para manejar el login de usuarios
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar datos de entrada
    const validatedData = loginSchema.parse(req.body);
    
    // Verificar credenciales
    const user = await userService.verifyCredentials(
      validatedData.username, 
      validatedData.password
    );
    
    if (!user) {
      throw new UnauthorizedError('Nombre de usuario o contraseña incorrectos');
    }
    
    // Generar tokens
    const token = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    
    // Devolver respuesta sin incluir la contraseña
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para renovar el token usando refresh token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar datos de entrada
    const validatedData = refreshTokenSchema.parse(req.body);
    
    // Verificar refresh token
    const decoded = authService.verifyRefreshToken(validatedData.refreshToken);
    
    if (!decoded) {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }
    
    // Obtener usuario (asegurando que el sub es un número)
    const userId = typeof decoded.sub === 'number' ? decoded.sub : parseInt(decoded.sub as string, 10);
    const user = await userService.getUserById(userId);
    
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }
    
    // Generar nuevo token
    const newToken = authService.generateToken(user);
    
    res.json({
      token: newToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener el perfil del usuario actual
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user es agregado por el middleware de autenticación
    if (!req.user) {
      throw new UnauthorizedError();
    }
    
    // Devolver usuario sin contraseña
    //@ts-ignore
    const { password, ...userWithoutPassword } = req.user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SALT_ROUNDS } from '../config';
import { User } from '@shared/schema';

// Definimos nuestra propia interfaz para los tokens JWT
export interface JwtPayload {
  sub: string | number; // Puede ser string o number
  type?: string;
  username?: string;
  iat?: number; // Issued at time
  exp?: number; // Expiration time
}

export class AuthService {
  /**
   * Genera un hash de la contraseña
   * @param password Contraseña en texto plano
   * @returns Contraseña hasheada
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verifica si una contraseña coincide con un hash
   * @param password Contraseña en texto plano
   * @param hashedPassword Hash de contraseña almacenado
   * @returns boolean indicando si la contraseña es correcta
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Genera un token JWT para un usuario
   * @param user Usuario para el que generar el token
   * @returns Token JWT generado
   */
  generateToken(user: Partial<User>): string {
    const payload = {
      sub: user.id,
      username: user.username,
      // No incluir datos sensibles como contraseña o información personal
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Genera un refresh token para un usuario
   * @param user Usuario para el que generar el refresh token
   * @returns Refresh token generado
   */
  generateRefreshToken(user: Partial<User>): string {
    const payload = {
      sub: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  }

  /**
   * Verifica un token JWT
   * @param token Token JWT a verificar
   * @returns Payload decodificado o null si es inválido
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && typeof decoded === 'object') {
        // Aseguramos que 'sub' siempre esté presente
        if (!('sub' in decoded)) {
          console.error('Token sin campo sub', decoded);
          return null;
        }
        
        // Convertimos a nuestra interfaz JwtPayload
        const sub = typeof decoded.sub === 'string' ? parseInt(decoded.sub, 10) : decoded.sub;
        
        return {
          sub: isNaN(sub as number) ? decoded.sub : sub, // Aseguramos que sea número si es posible
          type: 'type' in decoded ? (decoded.type as string) : undefined,
          username: 'username' in decoded ? (decoded.username as string) : undefined,
          iat: 'iat' in decoded ? (decoded.iat as number) : undefined,
          exp: 'exp' in decoded ? (decoded.exp as number) : undefined
        } as JwtPayload;
      }
      return null;
    } catch (error) {
      console.error('Error al verificar token:', error);
      return null;
    }
  }

  /**
   * Verifica un refresh token
   * @param refreshToken Refresh token a verificar
   * @returns Payload decodificado o null si es inválido
   */
  verifyRefreshToken(refreshToken: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      // Asegurarse de que es un refresh token y tiene 'sub'
      if (decoded && typeof decoded === 'object' && 
          'type' in decoded && decoded.type === 'refresh' &&
          'sub' in decoded) {
        
        // Convertimos a nuestra interfaz JwtPayload
        const sub = typeof decoded.sub === 'string' ? parseInt(decoded.sub, 10) : decoded.sub;
        
        return {
          sub: isNaN(sub as number) ? decoded.sub : sub, // Aseguramos que sea número si es posible
          type: 'refresh',
          iat: 'iat' in decoded ? decoded.iat as number : undefined,
          exp: 'exp' in decoded ? decoded.exp as number : undefined
        } as JwtPayload;
      }
      return null;
    } catch (error) {
      console.error('Error al verificar refresh token:', error);
      return null;
    }
  }
}

// Exportamos una instancia para usar como singleton
export const authService = new AuthService();
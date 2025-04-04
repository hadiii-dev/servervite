import { InsertUser, User, UserOccupation } from '@shared/schema';
import { storage } from '../storage';
import { authService } from './auth.service';

export class UserService {
  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Usuario encontrado o undefined
   */
  async getUserById(id: number): Promise<User | undefined> {
    return storage.getUser(id);
  }

  /**
   * Obtiene un usuario por su nombre de usuario
   * @param username Nombre de usuario
   * @returns Usuario encontrado o undefined
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return storage.getUserByUsername(username);
  }

  /**
   * Crea un nuevo usuario con contraseña hasheada
   * @param userData Datos del usuario a crear
   * @returns Usuario creado
   */
  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    // Hashear la contraseña antes de almacenarla
    const hashedPassword = await authService.hashPassword(userData.password);
    
    // Crear usuario con contraseña hasheada
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });
    
    return user;
  }

  /**
   * Actualiza los datos de un usuario
   * @param id ID del usuario
   * @param userData Datos a actualizar
   * @returns Usuario actualizado
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Si se está actualizando la contraseña, hashearla primero
    if (userData.password) {
      userData.password = await authService.hashPassword(userData.password);
    }
    
    return storage.updateUser(id, userData);
  }

  /**
   * Verifica las credenciales de un usuario
   * @param username Nombre de usuario
   * @param password Contraseña en texto plano
   * @returns Usuario si las credenciales son correctas, undefined si no
   */
  async verifyCredentials(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    
    if (!user || !user.password) {
      return undefined;
    }
    
    const isPasswordValid = await authService.verifyPassword(password, user.password);
    
    return isPasswordValid ? user : undefined;
  }
  
  /**
   * Obtiene las ocupaciones asociadas a un usuario
   * @param userId ID del usuario
   * @returns Lista de ocupaciones del usuario con nombres incluidos
   */
  async getUserOccupations(userId: number): Promise<(UserOccupation & { occupationName?: string })[]> {
    return storage.getUserOccupationsByUserId(userId);
  }
}

// Exportamos una instancia para usar como singleton
export const userService = new UserService();
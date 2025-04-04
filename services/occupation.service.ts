import { storage } from '../storage';
import fs from 'fs';
import { parse } from 'csv-parse';
import { 
  Occupation, 
  InsertOccupation, 
  UserOccupation, 
  InsertUserOccupation 
} from '@shared/schema';

/**
 * Servicio para manejar operaciones relacionadas con ocupaciones
 */
export class OccupationService {
  /**
   * Obtiene una ocupación por su ID
   * @param id ID de la ocupación
   * @returns Ocupación encontrada o undefined
   */
  async getOccupationById(id: number): Promise<Occupation | undefined> {
    return storage.getOccupation(id);
  }

  /**
   * Obtiene una lista de ocupaciones con filtrado opcional
   * @param searchQuery Consulta de búsqueda opcional
   * @returns Lista de ocupaciones
   */
  async getOccupations(searchQuery?: string): Promise<Occupation[]> {
    return storage.getOccupations(searchQuery);
  }

  /**
   * Crea una nueva ocupación
   * @param occupationData Datos de la ocupación a crear
   * @returns Ocupación creada
   */
  async createOccupation(occupationData: InsertOccupation): Promise<Occupation> {
    return storage.createOccupation(occupationData);
  }

  /**
   * Importa ocupaciones desde un archivo CSV
   * @param filePath Ruta al archivo CSV
   * @param language Código de idioma (opcional)
   * @returns Número de ocupaciones importadas
   */
  async importOccupationsFromCSV(filePath: string, language?: string): Promise<number> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    return storage.importOccupationsFromCSV(filePath);
  }

  /**
   * Obtiene una relación usuario-ocupación por su ID
   * @param id ID de la relación
   * @returns Relación encontrada o undefined
   */
  async getUserOccupation(id: number): Promise<UserOccupation | undefined> {
    return storage.getUserOccupation(id);
  }

  /**
   * Obtiene las ocupaciones asociadas a un usuario
   * @param userId ID del usuario
   * @returns Lista de ocupaciones del usuario con nombres incluidos
   */
  async getUserOccupations(userId: number): Promise<(UserOccupation & { occupationName?: string })[]> {
    return storage.getUserOccupationsByUserId(userId);
  }

  /**
   * Crea una nueva relación usuario-ocupación
   * @param userOccupationData Datos de la relación a crear
   * @returns Relación creada
   */
  async createUserOccupation(userOccupationData: InsertUserOccupation): Promise<UserOccupation> {
    return storage.createUserOccupation(userOccupationData);
  }
}

// Exportamos una instancia para usar como singleton
export const occupationService = new OccupationService();
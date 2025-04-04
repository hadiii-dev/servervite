import { InsertJob, Job, InsertUserJob, UserJob, SentimentType } from '@shared/schema';
import { storage } from '../storage';

export class JobService {
  /**
   * Obtiene un trabajo por su ID
   * @param id ID del trabajo
   * @returns Trabajo encontrado o undefined
   */
  async getJobById(id: number): Promise<Job | undefined> {
    return storage.getJob(id);
  }

  /**
   * Obtiene un trabajo por su ID externo
   * @param externalId ID externo del trabajo
   * @returns Trabajo encontrado o undefined
   */
  async getJobByExternalId(externalId: string): Promise<Job | undefined> {
    return storage.getJobByExternalId(externalId);
  }

  /**
   * Obtiene una lista de trabajos con opciones de paginación y exclusión
   * @param options Opciones de consulta (límite, offset, ids a excluir)
   * @returns Lista de trabajos
   */
  async getJobs(options?: { 
    limit?: number; 
    offset?: number; 
    excludeIds?: number[];
  }): Promise<Job[]> {
    return storage.getJobs(options);
  }

  /**
   * Crea un nuevo trabajo
   * @param jobData Datos del trabajo a crear
   * @returns Trabajo creado
   */
  async createJob(jobData: InsertJob): Promise<Job> {
    return storage.createJob(jobData);
  }

  /**
   * Registra una acción de usuario sobre un trabajo (guardar, aplicar, etc.)
   * @param userId ID del usuario
   * @param jobId ID del trabajo
   * @param action Tipo de acción ('save', 'apply', 'reject')
   * @param sentiment Sentimiento opcional del usuario hacia el trabajo
   * @returns Registro de acción creado
   */
  async recordUserJobAction(
    userId: number, 
    jobId: number, 
    action: 'save' | 'apply' | 'reject', 
    sentiment?: SentimentType
  ): Promise<UserJob> {
    const userJobData: InsertUserJob = {
      userId,
      jobId,
      action, // Usamos directamente la acción en lugar de campos booleanos
      sentiment: sentiment || null
    };
    
    return storage.createUserJob(userJobData);
  }

  /**
   * Obtiene los trabajos guardados por un usuario
   * @param userId ID del usuario
   * @returns Lista de trabajos guardados
   */
  async getUserSavedJobs(userId: number): Promise<Job[]> {
    return storage.getUserSavedJobs(userId);
  }

  /**
   * Obtiene los trabajos a los que ha aplicado un usuario
   * @param userId ID del usuario
   * @returns Lista de trabajos aplicados
   */
  async getUserAppliedJobs(userId: number): Promise<Job[]> {
    return storage.getUserAppliedJobs(userId);
  }
}

// Exportamos una instancia para usar como singleton
export const jobService = new JobService();
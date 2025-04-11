import {
  InsertAnonymousSession,
  AnonymousSession,
  InsertSessionJob,
  SessionJob,
  SentimentType,
  Job,
} from "../schemas";
import { storage } from "../storage";
import { v4 as uuidv4 } from "uuid";

export class SessionService {
  /**
   * Obtiene una sesión anónima por su ID
   * @param sessionId ID de la sesión
   * @returns Sesión encontrada o undefined
   */
  async getSession(sessionId: string): Promise<AnonymousSession | undefined> {
    return storage.getAnonymousSession(sessionId);
  }

  /**
   * Crea una nueva sesión anónima
   * @param sessionData Datos opcionales de la sesión
   * @returns Sesión creada
   */
  async createSession(
    sessionData?: Partial<InsertAnonymousSession>
  ): Promise<AnonymousSession> {
    const sessionId = uuidv4();

    const session: InsertAnonymousSession = {
      sessionId,
      preferences: JSON.stringify({
        profileCompleted: false,
        skills: [],
        locationPermission: false,
        completedModals: [],
      }),
      // No incluimos createdAt ya que se genera automáticamente en la base de datos
      ...sessionData,
    };

    return storage.createAnonymousSession(session);
  }

  /**
   * Actualiza una sesión anónima
   * @param sessionId ID de la sesión
   * @param sessionData Datos a actualizar
   * @returns Sesión actualizada o undefined si no existe
   */
  async updateSession(
    sessionId: string,
    sessionData: Partial<InsertAnonymousSession>
  ): Promise<AnonymousSession | undefined> {
    return storage.updateAnonymousSession(sessionId, sessionData);
  }

  /**
   * Actualiza las preferencias de una sesión
   * @param sessionId ID de la sesión
   * @param preferences Objeto de preferencias a actualizar (se fusiona con el existente)
   * @returns Sesión actualizada o undefined si no existe
   */
  async updatePreferences(
    sessionId: string,
    preferences: Record<string, any>
  ): Promise<AnonymousSession | undefined> {
    const session = await this.getSession(sessionId);

    if (!session) {
      return undefined;
    }

    // Parsear las preferencias actuales
    const currentPreferences = session.preferences
      ? JSON.parse(session.preferences as string)
      : {};

    // Fusionar con las nuevas preferencias
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    };

    // Actualizar la sesión
    return this.updateSession(sessionId, {
      preferences: JSON.stringify(updatedPreferences),
    });
  }

  /**
   * Registra una acción de sesión sobre un trabajo
   * @param sessionId ID de la sesión
   * @param jobId ID del trabajo
   * @param action Tipo de acción ('like', 'dislike', 'view')
   * @param sentiment Sentimiento opcional hacia el trabajo
   * @returns Registro de acción creado
   */
  async recordSessionJobAction(
    sessionId: string,
    jobId: number,
    action: "like" | "dislike" | "view",
    sentiment?: SentimentType
  ): Promise<SessionJob> {
    const sessionJobData: InsertSessionJob = {
      sessionId,
      jobId,
      action, // Usamos directamente la acción
      sentiment: sentiment || null,
    };

    return storage.createSessionJob(sessionJobData);
  }

  /**
   * Obtiene los trabajos que le han gustado a una sesión
   * @param sessionId ID de la sesión
   * @returns Lista de trabajos que han gustado
   */
  async getSessionLikedJobs(sessionId: string): Promise<Job[]> {
    return storage.getSessionLikedJobs(sessionId);
  }
}

// Exportamos una instancia para usar como singleton
export const sessionService = new SessionService();

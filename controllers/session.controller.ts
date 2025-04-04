import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/session.service';
import { jobService } from '../services/job.service';
import { NotFoundError, BadRequestError } from '../middleware/error.middleware';
import { SentimentType } from '@shared/schema';
import { z } from 'zod';

// Schema para validar acciones sobre trabajos en sesiones
const sessionJobActionSchema = z.object({
  jobId: z.number(),
  action: z.enum(['like', 'dislike', 'view']),
  sentiment: z.enum(['excited', 'interested', 'neutral', 'doubtful', 'negative']).optional()
});

// Schema para actualizar preferencias de sesión
const updateSessionSchema = z.object({
  preferences: z.record(z.any()).optional()
});

/**
 * Controlador para crear una nueva sesión anónima
 */
export const createSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await sessionService.createSession();
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener una sesión por ID
 */
export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('ID de sesión requerido');
    }
    
    const session = await sessionService.getSession(sessionId);
    
    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }
    
    res.json(session);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para actualizar una sesión
 */
export const updateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('ID de sesión requerido');
    }
    
    // Validar datos de entrada
    const validatedData = updateSessionSchema.parse(req.body);
    
    let updatedSession;
    
    // Si hay preferencias para actualizar, usar método específico
    if (validatedData.preferences) {
      updatedSession = await sessionService.updatePreferences(
        sessionId, 
        validatedData.preferences
      );
    } else {
      // Si no hay preferencias, actualizar otros campos si existen
      updatedSession = await sessionService.updateSession(
        sessionId, 
        req.body
      );
    }
    
    if (!updatedSession) {
      throw new NotFoundError('Sesión no encontrada');
    }
    
    res.json(updatedSession);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para registrar acción de sesión sobre un trabajo
 */
export const recordSessionJobAction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('ID de sesión requerido');
    }
    
    // Validar datos de entrada
    const validatedData = sessionJobActionSchema.parse(req.body);
    
    // Verificar que el trabajo existe
    const job = await jobService.getJobById(validatedData.jobId);
    
    if (!job) {
      throw new NotFoundError('Trabajo no encontrado');
    }
    
    // Verificar que la sesión existe
    const session = await sessionService.getSession(sessionId);
    
    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }
    
    // Registrar la acción
    const sessionJob = await sessionService.recordSessionJobAction(
      sessionId, 
      validatedData.jobId, 
      validatedData.action, 
      validatedData.sentiment as SentimentType
    );
    
    res.json({ success: true, sessionJob });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener los trabajos que le han gustado a una sesión
 */
export const getSessionLikedJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      throw new BadRequestError('ID de sesión requerido');
    }
    
    // Verificar que la sesión existe
    const session = await sessionService.getSession(sessionId);
    
    if (!session) {
      throw new NotFoundError('Sesión no encontrada');
    }
    
    const likedJobs = await sessionService.getSessionLikedJobs(sessionId);
    
    res.json(likedJobs);
  } catch (error) {
    next(error);
  }
};
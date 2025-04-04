import { Request, Response, NextFunction } from 'express';
import { occupationService } from '../services/occupation.service';
import { z } from 'zod';
import { insertOccupationSchema, insertUserOccupationSchema } from '@shared/schema';

/**
 * Controlador para obtener todas las ocupaciones con búsqueda opcional
 */
export const getOccupations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchQuery = req.query.search as string | undefined;
    const occupations = await occupationService.getOccupations(searchQuery);
    res.json(occupations);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener una ocupación por ID
 */
export const getOccupationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de ocupación inválido" });
    }

    const occupation = await occupationService.getOccupationById(id);
    if (!occupation) {
      return res.status(404).json({ error: "Ocupación no encontrada" });
    }

    res.json(occupation);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para crear una nueva ocupación
 */
export const createOccupation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const occupationData = insertOccupationSchema.parse(req.body);
    const occupation = await occupationService.createOccupation(occupationData);
    res.status(201).json(occupation);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para importar ocupaciones desde un archivo CSV
 */
export const importOccupationsFromCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      filePath: z.string(),
      language: z.string().optional()
    });
    
    const { filePath, language } = schema.parse(req.body);
    
    const occupationsCount = await occupationService.importOccupationsFromCSV(filePath, language);
    
    res.json({ 
      success: true, 
      message: `Importadas ${occupationsCount} ocupaciones para el idioma ${language || 'en'}` 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para obtener las ocupaciones de un usuario
 */
export const getUserOccupations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    const userOccupations = await occupationService.getUserOccupations(userId);
    res.json(userOccupations);
  } catch (error) {
    next(error);
  }
};

/**
 * Controlador para crear una relación usuario-ocupación
 */
export const createUserOccupation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userOccupationData = insertUserOccupationSchema.parse(req.body);
    const userOccupation = await occupationService.createUserOccupation(userOccupationData);
    res.status(201).json(userOccupation);
  } catch (error) {
    next(error);
  }
};
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Mensajes de error en diferentes idiomas (internacionalización)
const ERROR_MESSAGES = {
  // Errores generales
  GENERAL_ERROR: {
    en: 'An unexpected error occurred. Please try again later.',
    es: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.'
  },
  NOT_FOUND: {
    en: 'Resource not found.',
    es: 'Recurso no encontrado.'
  },
  VALIDATION_ERROR: {
    en: 'Validation error. Please check your input.',
    es: 'Error de validación. Por favor, revise los datos introducidos.'
  },
  
  // Errores de autenticación y autorización
  UNAUTHORIZED: {
    en: 'Authentication required. Please log in.',
    es: 'Autenticación requerida. Por favor, inicie sesión.'
  },
  FORBIDDEN: {
    en: 'You do not have permission to access this resource.',
    es: 'No tiene permiso para acceder a este recurso.'
  },
  INVALID_CREDENTIALS: {
    en: 'Invalid username or password.',
    es: 'Nombre de usuario o contraseña inválidos.'
  },
  TOKEN_EXPIRED: {
    en: 'Your session has expired. Please log in again.',
    es: 'Su sesión ha expirado. Por favor, inicie sesión de nuevo.'
  },
  
  // Errores de recursos
  RESOURCE_EXISTS: {
    en: 'Resource already exists.',
    es: 'El recurso ya existe.'
  },
  RESOURCE_NOT_FOUND: {
    en: 'Resource not found.',
    es: 'Recurso no encontrado.'
  },
  
  // Errores de la base de datos
  DATABASE_ERROR: {
    en: 'Database error. Please try again later.',
    es: 'Error de base de datos. Por favor, inténtelo de nuevo más tarde.'
  },
  
  // Errores de operación
  OPERATION_FAILED: {
    en: 'Operation failed. Please try again.',
    es: 'La operación falló. Por favor, inténtelo de nuevo.'
  }
};

// Determina el idioma preferido del usuario basado en el encabezado Accept-Language
function getPreferredLanguage(req: Request): 'en' | 'es' {
  const acceptLanguage = req.headers['accept-language'] || '';
  return acceptLanguage.toLowerCase().includes('es') ? 'es' : 'en';
}

// Obtiene el mensaje de error localizado
function getErrorMessage(key: keyof typeof ERROR_MESSAGES, lang: 'en' | 'es'): string {
  return ERROR_MESSAGES[key]?.[lang] || ERROR_MESSAGES.GENERAL_ERROR[lang];
}

// Clase base para errores de la aplicación
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorKey: keyof typeof ERROR_MESSAGES;
  
  constructor(message: string, statusCode: number, errorKey: keyof typeof ERROR_MESSAGES, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorKey = errorKey;
    
    // Esto es necesario debido a cómo funcionan las clases de JavaScript con el objeto Error
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
  
  getLocalizedMessage(lang: 'en' | 'es'): string {
    return getErrorMessage(this.errorKey, lang);
  }
}

// Errores específicos para diferentes casos de uso
export class BadRequestError extends AppError {
  constructor(message?: string) {
    super(message || 'Bad request', 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(message || 'Unauthorized', 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(message || 'Forbidden', 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(message || 'Not found', 404, 'RESOURCE_NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message?: string) {
    super(message || 'Resource already exists', 409, 'RESOURCE_EXISTS');
  }
}

export class ValidationError extends AppError {
  errors: any;
  
  constructor(message?: string, errors?: any) {
    super(message || 'Validation error', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

// Middleware para manejar errores de manera centralizada
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const lang = getPreferredLanguage(req);
  
  // Si es un error operacional de nuestra aplicación
  if (err instanceof AppError) {
    // Incluimos datos adicionales en el registro de error
    logger.error(`${err.statusCode} - ${err.message}`, {
      source: 'error-handler',
      data: {
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        isOperational: err.isOperational,
        stack: err.stack,
        // Incluimos detalles específicos para errores de validación
        ...(err instanceof ValidationError ? { validationErrors: err.errors } : {})
      }
    });
    
    // Enviamos respuesta con mensaje localizado
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.getLocalizedMessage(lang),
      ...(err instanceof ValidationError ? { errors: err.errors } : {})
    });
  }
  
  // Error no controlado
  logger.error(`500 - ${err.message || 'Unknown error'}`, {
    source: 'error-handler',
    data: {
      path: req.path,
      method: req.method,
      stack: err.stack
    }
  });
  
  // No exponemos detalles de errores inesperados al cliente en producción
  const isDevelopment = process.env.NODE_ENV !== 'production';
  return res.status(500).json({
    status: 'error',
    message: getErrorMessage('GENERAL_ERROR', lang),
    ...(isDevelopment ? { 
      error: err.message,
      stack: err.stack 
    } : {})
  });
};

// Middleware para manejar rutas no encontradas (404)
export const notFoundHandler = (req: Request, res: Response) => {
  const lang = getPreferredLanguage(req);
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    source: 'error-handler'
  });
  
  res.status(404).json({
    status: 'error',
    message: getErrorMessage('NOT_FOUND', lang)
  });
};
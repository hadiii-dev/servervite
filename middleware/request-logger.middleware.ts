import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware para registrar información detallada de las solicitudes HTTP
 * Solo registra solicitudes a endpoints de API y excluye rutas de assets estáticos
 */
export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Solo registramos solicitudes a la API, no a assets estáticos
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }
  
  const startTime = Date.now();
  
  // Función para registrar la respuesta cuando finaliza
  const logResponse = () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    // Solo logueamos en nivel debug las solicitudes exitosas
    // y como warning las solicitudes con error
    if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${url} ${statusCode} - ${duration}ms`, {
        source: 'http',
        userId: (req as any).user?.id,
        sessionId: (req as any).sessionId,
        data: {
          statusCode,
          method,
          url,
          duration,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          query: req.query,
          params: req.params,
          // Solo incluimos el body en caso de error y para métodos que lo tengan
          ...(method !== 'GET' && method !== 'HEAD' ? { body: req.body } : {})
        }
      });
    } else {
      logger.debug(`HTTP ${method} ${url} ${statusCode} - ${duration}ms`, {
        source: 'http',
        userId: (req as any).user?.id,
        sessionId: (req as any).sessionId
      });
    }
  };
  
  // Registramos cuando se complete la respuesta
  res.on('finish', logResponse);
  
  next();
};

export default requestLoggerMiddleware;
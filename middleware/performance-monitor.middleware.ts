import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Umbral de tiempo para considerar una solicitud como lenta (en milisegundos)
const SLOW_REQUEST_THRESHOLD = 1000; // 1 segundo

/**
 * Middleware para monitorear el rendimiento de las solicitudes HTTP
 * Registra como advertencia las solicitudes que toman más del umbral definido
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  // Solo monitoreamos solicitudes a la API
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }
  
  const startTime = Date.now();
  
  // Función para registrar el tiempo de respuesta cuando finaliza
  const logPerformance = () => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const url = req.originalUrl;
    
    // Si la solicitud es lenta, registramos una advertencia
    if (duration > SLOW_REQUEST_THRESHOLD) {
      logger.warn(`SLOW REQUEST: HTTP ${method} ${url} - ${duration}ms`, {
        source: 'performance',
        data: {
          method,
          url,
          duration,
          threshold: SLOW_REQUEST_THRESHOLD,
          query: req.query,
          // Incluimos el body solo para métodos que lo tengan
          ...(method !== 'GET' && method !== 'HEAD' ? { body: req.body } : {})
        }
      });
    }
  };
  
  // Registramos cuando se complete la respuesta
  res.on('finish', logPerformance);
  
  next();
};

export default performanceMonitor;
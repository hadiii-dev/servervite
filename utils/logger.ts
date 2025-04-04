/**
 * Utility for structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  source?: string;
  data?: any;
  userId?: number | string;
  sessionId?: string;
}

/**
 * Formats a log message with additional context data
 */
function formatLog(level: LogLevel, message: string, options: LogOptions = {}): string {
  const timestamp = new Date().toISOString();
  const source = options.source || 'app';
  
  // Información básica del log en formato JSON
  const logData = {
    timestamp,
    level,
    source,
    message,
    // Solo incluimos estos campos si están presentes
    ...(options.userId ? { userId: options.userId } : {}),
    ...(options.sessionId ? { sessionId: options.sessionId } : {}),
    ...(options.data ? { data: options.data } : {})
  };
  
  return JSON.stringify(logData);
}

/**
 * Debug level logging (development only)
 */
export function debug(message: string, options: LogOptions = {}) {
  // Solo mostramos logs de debug en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.debug(formatLog('debug', message, options));
  }
}

/**
 * Info level logging
 */
export function info(message: string, options: LogOptions = {}) {
  console.info(formatLog('info', message, options));
}

/**
 * Warning level logging
 */
export function warn(message: string, options: LogOptions = {}) {
  console.warn(formatLog('warn', message, options));
}

/**
 * Error level logging
 */
export function error(message: string, options: LogOptions = {}) {
  console.error(formatLog('error', message, options));
}

/**
 * Log an API request (for debugging)
 */
export function logRequest(req: any, responseTime?: number) {
  if (process.env.NODE_ENV === 'production') return;
  
  debug(`${req.method} ${req.originalUrl}${responseTime ? ` (${responseTime}ms)` : ''}`, {
    source: 'http',
    data: {
      method: req.method,
      path: req.originalUrl,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      responseTime
    }
  });
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Exportamos como default y como objeto nombrado para diferentes estilos de importación
export default {
  debug,
  info,
  warn,
  error,
  logRequest
};
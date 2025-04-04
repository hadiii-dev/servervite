/**
 * Clase para representar errores de API con información estructurada
 * que puede ser serializada y enviada al cliente
 */
export class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errors?: Record<string, any>;
  
  constructor(
    message: string, 
    statusCode: number, 
    errors?: Record<string, any>,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;
    
    // Esto es necesario debido a cómo funcionan las clases de JavaScript con el objeto Error
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Crea un ApiError para respuesta 400 Bad Request
   */
  static badRequest(message: string, errors?: Record<string, any>): ApiError {
    return new ApiError(message || 'Bad Request', 400, errors);
  }
  
  /**
   * Crea un ApiError para respuesta 401 Unauthorized
   */
  static unauthorized(message: string = 'Authentication required'): ApiError {
    return new ApiError(message, 401);
  }
  
  /**
   * Crea un ApiError para respuesta 403 Forbidden
   */
  static forbidden(message: string = 'Access denied'): ApiError {
    return new ApiError(message, 403);
  }
  
  /**
   * Crea un ApiError para respuesta 404 Not Found
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404);
  }
  
  /**
   * Crea un ApiError para respuesta 409 Conflict
   */
  static conflict(message: string = 'Resource already exists'): ApiError {
    return new ApiError(message, 409);
  }
  
  /**
   * Crea un ApiError para respuesta 422 Unprocessable Entity
   * (Útil para errores de validación)
   */
  static validationError(message: string = 'Validation error', errors?: Record<string, any>): ApiError {
    return new ApiError(message, 422, errors);
  }
  
  /**
   * Crea un ApiError para respuesta 500 Internal Server Error
   */
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500, undefined, false);
  }
  
  /**
   * Convierte el error a un objeto que puede ser serializado a JSON
   */
  toJSON(): Record<string, any> {
    return {
      status: this.status,
      message: this.message,
      ...(this.errors ? { errors: this.errors } : {})
    };
  }
}

export default ApiError;
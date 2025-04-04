import { Request, Response, NextFunction } from 'express';

/**
 * Envuelve controladores asíncronos para capturar errores y pasarlos al middleware de errores
 * Evita tener que escribir bloques try/catch en cada controlador
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
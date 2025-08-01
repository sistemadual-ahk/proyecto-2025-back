import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, public validationErrors?: string[]) {
    super(message, 400);
  }
}

export const errorHandler = (
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error en middleware:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  const response: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };

  if (error instanceof ValidationError && error.validationErrors) {
    response.details = { validationErrors: error.validationErrors };
  }

  if (process.env['NODE_ENV'] === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 
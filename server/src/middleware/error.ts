// ============================================
// Global Error Handler
// ============================================
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Generic server error
  console.error('[Server Error]:', err);
  
  const statusCode = err.statusCode || 500;
  const message = config.app.nodeEnv === 'production' 
    ? 'Internal server error' 
    : err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

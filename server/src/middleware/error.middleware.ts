import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // If headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return _next(err);
  }

  // AppError instance
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code, err.details);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    const message = `An entity with this ${field} already exists.`;
    return sendError(res, 409, message, 'CONFLICT', { field });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`, 'VALIDATION_ERROR');
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 422, 'Database validation failure', 'VALIDATION_ERROR', details);
  }

  // JSON parse syntax error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return sendError(res, 400, 'Malformed JSON body in request', 'VALIDATION_ERROR');
  }

  // Unhandled internal server error
  console.error('[Unhandled Error]', err);
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal server error';

  return sendError(
    res,
    500,
    message,
    'INTERNAL_ERROR',
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
}

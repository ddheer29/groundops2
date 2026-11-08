import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export interface ParseableSchema<T = any> {
  parse(data: unknown): T;
}

export function validateBody(schema: ParseableSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || Array.isArray(err?.errors)) {
        const issues = (err.errors || []).map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message || 'Invalid value',
        }));
        return next(AppError.unprocessable('Validation failed', issues));
      }
      next(err);
    }
  };
}

export function validateQuery(schema: ParseableSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || Array.isArray(err?.errors)) {
        const issues = (err.errors || []).map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message || 'Invalid value',
        }));
        return next(AppError.unprocessable('Invalid query parameters', issues));
      }
      next(err);
    }
  };
}

export function validateParams(schema: ParseableSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err: any) {
      if (err instanceof ZodError || Array.isArray(err?.errors)) {
        const issues = (err.errors || []).map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message || 'Invalid value',
        }));
        return next(AppError.unprocessable('Invalid URL parameters', issues));
      }
      next(err);
    }
  };
}

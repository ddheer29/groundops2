import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export interface ParseableSchema<T = any> {
  parse(data: unknown): T;
}

function extractZodIssues(err: any) {
  const rawList = err.issues || err.errors || [];
  return rawList.map((e: any) => ({
    field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
    message: e.message || 'Invalid value',
  }));
}

export function validateBody(schema: ParseableSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (
        err instanceof ZodError ||
        err?.name === 'ZodError' ||
        Array.isArray(err?.issues) ||
        Array.isArray(err?.errors)
      ) {
        return next(AppError.unprocessable('Validation failed', extractZodIssues(err)));
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
      if (
        err instanceof ZodError ||
        err?.name === 'ZodError' ||
        Array.isArray(err?.issues) ||
        Array.isArray(err?.errors)
      ) {
        return next(AppError.unprocessable('Invalid query parameters', extractZodIssues(err)));
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
      if (
        err instanceof ZodError ||
        err?.name === 'ZodError' ||
        Array.isArray(err?.issues) ||
        Array.isArray(err?.errors)
      ) {
        return next(AppError.unprocessable('Invalid URL parameters', extractZodIssues(err)));
      }
      next(err);
    }
  };
}

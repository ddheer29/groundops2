import { ApiErrorCode } from '@groundops/contracts';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code: ApiErrorCode = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code: ApiErrorCode = 'VALIDATION_ERROR', details?: unknown) {
    return new AppError(400, message, code, details);
  }

  static unauthorized(message: string = 'Authentication required', code: ApiErrorCode = 'UNAUTHENTICATED') {
    return new AppError(401, message, code);
  }

  static forbidden(message: string = 'Access denied', code: ApiErrorCode = 'FORBIDDEN') {
    return new AppError(403, message, code);
  }

  static notFound(message: string = 'Resource not found', code: ApiErrorCode = 'NOT_FOUND') {
    return new AppError(404, message, code);
  }

  static conflict(message: string, code: ApiErrorCode = 'CONFLICT') {
    return new AppError(409, message, code);
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(422, message, 'VALIDATION_ERROR', details);
  }
}

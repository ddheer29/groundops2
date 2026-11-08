"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, message, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, code = 'VALIDATION_ERROR', details) {
        return new AppError(400, message, code, details);
    }
    static unauthorized(message = 'Authentication required', code = 'UNAUTHENTICATED') {
        return new AppError(401, message, code);
    }
    static forbidden(message = 'Access denied', code = 'FORBIDDEN') {
        return new AppError(403, message, code);
    }
    static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
        return new AppError(404, message, code);
    }
    static conflict(message, code = 'CONFLICT') {
        return new AppError(409, message, code);
    }
    static unprocessable(message, details) {
        return new AppError(422, message, 'VALIDATION_ERROR', details);
    }
}
exports.AppError = AppError;

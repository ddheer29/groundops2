"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
const app_error_1 = require("../utils/app-error");
function extractZodIssues(err) {
    const rawList = err.issues || err.errors || [];
    return rawList.map((e) => ({
        field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message || 'Invalid value',
    }));
}
function validateBody(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError ||
                err?.name === 'ZodError' ||
                Array.isArray(err?.issues) ||
                Array.isArray(err?.errors)) {
                return next(app_error_1.AppError.unprocessable('Validation failed', extractZodIssues(err)));
            }
            next(err);
        }
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError ||
                err?.name === 'ZodError' ||
                Array.isArray(err?.issues) ||
                Array.isArray(err?.errors)) {
                return next(app_error_1.AppError.unprocessable('Invalid query parameters', extractZodIssues(err)));
            }
            next(err);
        }
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError ||
                err?.name === 'ZodError' ||
                Array.isArray(err?.issues) ||
                Array.isArray(err?.errors)) {
                return next(app_error_1.AppError.unprocessable('Invalid URL parameters', extractZodIssues(err)));
            }
            next(err);
        }
    };
}

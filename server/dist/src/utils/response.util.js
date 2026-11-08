"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, message, data, statusCode = 200) {
    const payload = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(payload);
}
function sendError(res, statusCode, message, code = 'INTERNAL_ERROR', details) {
    const payload = {
        success: false,
        message,
        error: {
            code,
            details,
        },
    };
    return res.status(statusCode).json(payload);
}

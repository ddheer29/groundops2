"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorResponseSchema = exports.ApiErrorDetailSchema = exports.ApiErrorCodeSchema = void 0;
exports.createApiSuccessResponseSchema = createApiSuccessResponseSchema;
const zod_1 = require("zod");
exports.ApiErrorCodeSchema = zod_1.z.enum([
    'VALIDATION_ERROR',
    'UNAUTHENTICATED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'RATE_LIMITED',
    'INVALID_TOKEN',
    'TOKEN_EXPIRED',
    'ACCOUNT_DISABLED',
    'ORGANISATION_INACTIVE',
    'INTERNAL_ERROR',
]);
exports.ApiErrorDetailSchema = zod_1.z.object({
    code: zod_1.z.string(),
    details: zod_1.z.unknown().optional(),
});
exports.ApiErrorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    message: zod_1.z.string(),
    error: exports.ApiErrorDetailSchema,
});
function createApiSuccessResponseSchema(dataSchema) {
    return zod_1.z.object({
        success: zod_1.z.literal(true),
        message: zod_1.z.string(),
        data: dataSchema,
    });
}
//# sourceMappingURL=common.schema.js.map
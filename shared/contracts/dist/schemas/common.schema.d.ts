import { z } from 'zod';
export declare const ApiErrorCodeSchema: z.ZodEnum<{
    VALIDATION_ERROR: "VALIDATION_ERROR";
    UNAUTHENTICATED: "UNAUTHENTICATED";
    FORBIDDEN: "FORBIDDEN";
    NOT_FOUND: "NOT_FOUND";
    CONFLICT: "CONFLICT";
    RATE_LIMITED: "RATE_LIMITED";
    INVALID_TOKEN: "INVALID_TOKEN";
    TOKEN_EXPIRED: "TOKEN_EXPIRED";
    ACCOUNT_DISABLED: "ACCOUNT_DISABLED";
    ORGANISATION_INACTIVE: "ORGANISATION_INACTIVE";
    INTERNAL_ERROR: "INTERNAL_ERROR";
}>;
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;
export declare const ApiErrorDetailSchema: z.ZodObject<{
    code: z.ZodString;
    details: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const ApiErrorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    message: z.ZodString;
    error: z.ZodObject<{
        code: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export declare function createApiSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
    success: z.ZodLiteral<true>;
    message: z.ZodString;
    data: T;
}, z.core.$strip>;
export type ApiSuccessResponse<T> = {
    success: true;
    message: string;
    data: T;
};
//# sourceMappingURL=common.schema.d.ts.map
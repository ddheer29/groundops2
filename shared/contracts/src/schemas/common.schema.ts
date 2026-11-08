import { z } from 'zod';

export const ApiErrorCodeSchema = z.enum([
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

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  details: z.unknown().optional(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: ApiErrorDetailSchema,
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export function createApiSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });
}

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

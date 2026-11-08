import { Response } from 'express';
import { ApiErrorResponse, ApiSuccessResponse, ApiErrorCode } from '@groundops/contracts';

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = 200
): Response<ApiSuccessResponse<T>> {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code: ApiErrorCode | string = 'INTERNAL_ERROR',
  details?: unknown
): Response<ApiErrorResponse> {
  const payload: ApiErrorResponse = {
    success: false,
    message,
    error: {
      code,
      details,
    },
  };
  return res.status(statusCode).json(payload);
}

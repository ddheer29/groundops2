import { z } from 'zod';
import { UserSchema } from './user.schema';
import { OrganisationSchema } from './organisation.schema';

export const LoginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid work email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
  organisation: OrganisationSchema,
});

export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;

export const SetPasswordRequestSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, 'Invitation token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type SetPasswordRequest = z.infer<typeof SetPasswordRequestSchema>;

export const SetPasswordResponseDataSchema = z.object({
  user: UserSchema,
  organisation: OrganisationSchema,
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export type SetPasswordResponseData = z.infer<typeof SetPasswordResponseDataSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const RefreshTokenResponseDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenResponseData = z.infer<typeof RefreshTokenResponseDataSchema>;

export const LogoutRequestSchema = z.object({
  refreshToken: z.string().optional(),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

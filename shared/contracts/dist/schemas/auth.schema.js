"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutRequestSchema = exports.RefreshTokenResponseDataSchema = exports.RefreshTokenRequestSchema = exports.SetPasswordResponseDataSchema = exports.SetPasswordRequestSchema = exports.LoginResponseDataSchema = exports.LoginRequestSchema = void 0;
const zod_1 = require("zod");
const user_schema_1 = require("./user.schema");
const organisation_schema_1 = require("./organisation.schema");
exports.LoginRequestSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email('Please enter a valid work email address'),
    password: zod_1.z
        .string()
        .min(1, 'Password is required'),
});
exports.LoginResponseDataSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    user: user_schema_1.UserSchema,
    organisation: organisation_schema_1.OrganisationSchema,
});
exports.SetPasswordRequestSchema = zod_1.z.object({
    token: zod_1.z
        .string()
        .trim()
        .min(1, 'Invitation token is required'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(100, 'Password must not exceed 100 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});
exports.SetPasswordResponseDataSchema = zod_1.z.object({
    user: user_schema_1.UserSchema,
    organisation: organisation_schema_1.OrganisationSchema,
    accessToken: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
});
exports.RefreshTokenRequestSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.RefreshTokenResponseDataSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
});
exports.LogoutRequestSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().optional(),
});
//# sourceMappingURL=auth.schema.js.map
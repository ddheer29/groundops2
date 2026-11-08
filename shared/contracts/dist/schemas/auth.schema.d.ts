import { z } from 'zod';
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export declare const LoginResponseDataSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<{
            ADMIN: "ADMIN";
            MANAGER: "MANAGER";
            TECHNICIAN: "TECHNICIAN";
        }>;
        organisationId: z.ZodString;
        invitedBy: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            INVITED: "INVITED";
            ACTIVE: "ACTIVE";
            DISABLED: "DISABLED";
        }>;
        emailVerified: z.ZodBoolean;
        lastLoginAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    organisation: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        organisationCode: z.ZodString;
        email: z.ZodString;
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;
export declare const SetPasswordRequestSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type SetPasswordRequest = z.infer<typeof SetPasswordRequestSchema>;
export declare const SetPasswordResponseDataSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<{
            ADMIN: "ADMIN";
            MANAGER: "MANAGER";
            TECHNICIAN: "TECHNICIAN";
        }>;
        organisationId: z.ZodString;
        invitedBy: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            INVITED: "INVITED";
            ACTIVE: "ACTIVE";
            DISABLED: "DISABLED";
        }>;
        emailVerified: z.ZodBoolean;
        lastLoginAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    organisation: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        organisationCode: z.ZodString;
        email: z.ZodString;
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SetPasswordResponseData = z.infer<typeof SetPasswordResponseDataSchema>;
export declare const RefreshTokenRequestSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export declare const RefreshTokenResponseDataSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
}, z.core.$strip>;
export type RefreshTokenResponseData = z.infer<typeof RefreshTokenResponseDataSchema>;
export declare const LogoutRequestSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
//# sourceMappingURL=auth.schema.d.ts.map
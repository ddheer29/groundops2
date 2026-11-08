import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
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
export type User = z.infer<typeof UserSchema>;
export declare const UserSummarySchema: z.ZodObject<{
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
    status: z.ZodEnum<{
        INVITED: "INVITED";
        ACTIVE: "ACTIVE";
        DISABLED: "DISABLED";
    }>;
}, z.core.$strip>;
export type UserSummary = z.infer<typeof UserSummarySchema>;
export declare const UserProfileResponseSchema: z.ZodObject<{
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
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
//# sourceMappingURL=user.schema.d.ts.map
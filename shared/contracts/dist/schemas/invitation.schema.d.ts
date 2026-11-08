import { z } from 'zod';
export declare const CreateInvitationRequestSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        TECHNICIAN: "TECHNICIAN";
    }>>;
}, z.core.$strip>;
export type CreateInvitationRequest = z.infer<typeof CreateInvitationRequestSchema>;
export declare const InvitationSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        TECHNICIAN: "TECHNICIAN";
    }>;
    organisationId: z.ZodString;
    invitedBy: z.ZodString;
    expiresAt: z.ZodString;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        ACCEPTED: "ACCEPTED";
        EXPIRED: "EXPIRED";
        REVOKED: "REVOKED";
    }>;
    acceptedAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Invitation = z.infer<typeof InvitationSchema>;
export declare const VerifyInvitationResponseSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    firstName: z.ZodString;
    email: z.ZodString;
    organisationName: z.ZodString;
    expiresAt: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        TECHNICIAN: "TECHNICIAN";
    }>;
}, z.core.$strip>;
export type VerifyInvitationResponse = z.infer<typeof VerifyInvitationResponseSchema>;
export declare const InvitationListItemSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<{
        ADMIN: "ADMIN";
        MANAGER: "MANAGER";
        TECHNICIAN: "TECHNICIAN";
    }>;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        ACCEPTED: "ACCEPTED";
        EXPIRED: "EXPIRED";
        REVOKED: "REVOKED";
    }>;
    expiresAt: z.ZodString;
    createdAt: z.ZodString;
    inviterName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type InvitationListItem = z.infer<typeof InvitationListItemSchema>;
//# sourceMappingURL=invitation.schema.d.ts.map
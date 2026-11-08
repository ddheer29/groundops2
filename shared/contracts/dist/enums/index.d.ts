import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<{
    ADMIN: "ADMIN";
    MANAGER: "MANAGER";
    TECHNICIAN: "TECHNICIAN";
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const UserStatusSchema: z.ZodEnum<{
    INVITED: "INVITED";
    ACTIVE: "ACTIVE";
    DISABLED: "DISABLED";
}>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export declare const OrganisationStatusSchema: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    INACTIVE: "INACTIVE";
}>;
export type OrganisationStatus = z.infer<typeof OrganisationStatusSchema>;
export declare const InvitationStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    ACCEPTED: "ACCEPTED";
    EXPIRED: "EXPIRED";
    REVOKED: "REVOKED";
}>;
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;
//# sourceMappingURL=index.d.ts.map
import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['INVITED', 'ACTIVE', 'DISABLED']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const OrganisationStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export type OrganisationStatus = z.infer<typeof OrganisationStatusSchema>;

export const InvitationStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'EXPIRED',
  'REVOKED',
]);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

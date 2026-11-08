import { z } from 'zod';
import { UserRoleSchema, UserStatusSchema } from '../enums';
import { OrganisationSummarySchema } from './organisation.schema';

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: UserRoleSchema,
  organisationId: z.string(),
  invitedBy: z.string().nullable(),
  status: UserStatusSchema,
  emailVerified: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const UserSummarySchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  organisationId: z.string(),
  status: UserStatusSchema,
});

export type UserSummary = z.infer<typeof UserSummarySchema>;

export const UserProfileResponseSchema = z.object({
  user: UserSchema,
  organisation: OrganisationSummarySchema,
});

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

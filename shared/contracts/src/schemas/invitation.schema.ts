import { z } from 'zod';
import { UserRoleSchema, InvitationStatusSchema } from '../enums';

export const CreateInvitationRequestSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  role: UserRoleSchema.default('TECHNICIAN'),
});

export type CreateInvitationRequest = z.infer<typeof CreateInvitationRequestSchema>;

export const InvitationSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  organisationId: z.string(),
  invitedBy: z.string(),
  expiresAt: z.string().datetime(),
  status: InvitationStatusSchema,
  acceptedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Invitation = z.infer<typeof InvitationSchema>;

export const VerifyInvitationResponseSchema = z.object({
  valid: z.boolean(),
  firstName: z.string(),
  email: z.string().email(),
  organisationName: z.string(),
  expiresAt: z.string().datetime(),
  role: UserRoleSchema,
});

export type VerifyInvitationResponse = z.infer<typeof VerifyInvitationResponseSchema>;

export const InvitationListItemSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  status: InvitationStatusSchema,
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  inviterName: z.string().optional(),
});

export type InvitationListItem = z.infer<typeof InvitationListItemSchema>;

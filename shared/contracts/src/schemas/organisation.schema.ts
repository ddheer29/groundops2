import { z } from 'zod';
import { OrganisationStatusSchema } from '../enums';

export const OrganisationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Organisation name is required'),
  organisationCode: z.string().min(1, 'Organisation code is required'),
  email: z.string().email('Invalid organisation email address'),
  status: OrganisationStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Organisation = z.infer<typeof OrganisationSchema>;

export const OrganisationSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  organisationCode: z.string(),
  status: OrganisationStatusSchema,
});

export type OrganisationSummary = z.infer<typeof OrganisationSummarySchema>;

export const OrganisationStatsSchema = z.object({
  organisation: OrganisationSummarySchema,
  totalTechnicians: z.number(),
  activeTechnicians: z.number(),
  pendingInvitations: z.number(),
});

export type OrganisationStats = z.infer<typeof OrganisationStatsSchema>;

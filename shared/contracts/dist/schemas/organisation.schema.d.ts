import { z } from 'zod';
export declare const OrganisationSchema: z.ZodObject<{
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
export type Organisation = z.infer<typeof OrganisationSchema>;
export declare const OrganisationSummarySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    organisationCode: z.ZodString;
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>;
}, z.core.$strip>;
export type OrganisationSummary = z.infer<typeof OrganisationSummarySchema>;
export declare const OrganisationStatsSchema: z.ZodObject<{
    organisation: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        organisationCode: z.ZodString;
        status: z.ZodEnum<{
            ACTIVE: "ACTIVE";
            INACTIVE: "INACTIVE";
        }>;
    }, z.core.$strip>;
    totalTechnicians: z.ZodNumber;
    activeTechnicians: z.ZodNumber;
    pendingInvitations: z.ZodNumber;
}, z.core.$strip>;
export type OrganisationStats = z.infer<typeof OrganisationStatsSchema>;
//# sourceMappingURL=organisation.schema.d.ts.map
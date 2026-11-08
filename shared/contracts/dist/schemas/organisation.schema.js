"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationStatsSchema = exports.OrganisationSummarySchema = exports.OrganisationSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
exports.OrganisationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Organisation name is required'),
    organisationCode: zod_1.z.string().min(1, 'Organisation code is required'),
    email: zod_1.z.string().email('Invalid organisation email address'),
    status: enums_1.OrganisationStatusSchema,
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.OrganisationSummarySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    organisationCode: zod_1.z.string(),
    status: enums_1.OrganisationStatusSchema,
});
exports.OrganisationStatsSchema = zod_1.z.object({
    organisation: exports.OrganisationSummarySchema,
    totalTechnicians: zod_1.z.number(),
    activeTechnicians: zod_1.z.number(),
    pendingInvitations: zod_1.z.number(),
});
//# sourceMappingURL=organisation.schema.js.map
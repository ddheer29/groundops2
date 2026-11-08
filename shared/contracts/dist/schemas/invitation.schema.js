"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationListItemSchema = exports.VerifyInvitationResponseSchema = exports.InvitationSchema = exports.CreateInvitationRequestSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
exports.CreateInvitationRequestSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .trim()
        .min(1, 'First name is required')
        .max(50, 'First name must not exceed 50 characters'),
    lastName: zod_1.z
        .string()
        .trim()
        .min(1, 'Last name is required')
        .max(50, 'Last name must not exceed 50 characters'),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email('Invalid email address format'),
    role: enums_1.UserRoleSchema.default('TECHNICIAN'),
});
exports.InvitationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    role: enums_1.UserRoleSchema,
    organisationId: zod_1.z.string(),
    invitedBy: zod_1.z.string(),
    expiresAt: zod_1.z.string().datetime(),
    status: enums_1.InvitationStatusSchema,
    acceptedAt: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.VerifyInvitationResponseSchema = zod_1.z.object({
    valid: zod_1.z.boolean(),
    firstName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    organisationName: zod_1.z.string(),
    expiresAt: zod_1.z.string().datetime(),
    role: enums_1.UserRoleSchema,
});
exports.InvitationListItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    role: enums_1.UserRoleSchema,
    status: enums_1.InvitationStatusSchema,
    expiresAt: zod_1.z.string().datetime(),
    createdAt: zod_1.z.string().datetime(),
    inviterName: zod_1.z.string().optional(),
});
//# sourceMappingURL=invitation.schema.js.map
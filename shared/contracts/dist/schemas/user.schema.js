"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileResponseSchema = exports.UserSummarySchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const organisation_schema_1 = require("./organisation.schema");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    role: enums_1.UserRoleSchema,
    organisationId: zod_1.z.string(),
    invitedBy: zod_1.z.string().nullable(),
    status: enums_1.UserStatusSchema,
    emailVerified: zod_1.z.boolean(),
    lastLoginAt: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.UserSummarySchema = zod_1.z.object({
    id: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: enums_1.UserRoleSchema,
    organisationId: zod_1.z.string(),
    status: enums_1.UserStatusSchema,
});
exports.UserProfileResponseSchema = zod_1.z.object({
    user: exports.UserSchema,
    organisation: organisation_schema_1.OrganisationSummarySchema,
});
//# sourceMappingURL=user.schema.js.map
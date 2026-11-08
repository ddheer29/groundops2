"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationStatusSchema = exports.OrganisationStatusSchema = exports.UserStatusSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN']);
exports.UserStatusSchema = zod_1.z.enum(['INVITED', 'ACTIVE', 'DISABLED']);
exports.OrganisationStatusSchema = zod_1.z.enum(['ACTIVE', 'INACTIVE']);
exports.InvitationStatusSchema = zod_1.z.enum([
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'REVOKED',
]);
//# sourceMappingURL=index.js.map
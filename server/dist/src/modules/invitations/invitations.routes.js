"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationRoutes = void 0;
const express_1 = require("express");
const contracts_1 = require("@groundops/contracts");
const invitations_controller_1 = require("./invitations.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const rate_limit_middleware_1 = require("../../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Public route: Verify invitation token
router.get('/verify/:token', invitations_controller_1.invitationsController.verify);
// Protected routes (Admin / Manager only)
router.use(auth_middleware_1.authenticate);
router.post('/', (0, role_middleware_1.requireRoles)('ADMIN'), rate_limit_middleware_1.invitationLimiter, (0, validate_middleware_1.validateBody)(contracts_1.CreateInvitationRequestSchema), invitations_controller_1.invitationsController.create);
router.get('/', (0, role_middleware_1.requireRoles)('ADMIN', 'MANAGER'), invitations_controller_1.invitationsController.list);
router.post('/:id/resend', (0, role_middleware_1.requireRoles)('ADMIN'), rate_limit_middleware_1.invitationLimiter, invitations_controller_1.invitationsController.resend);
router.post('/:id/revoke', (0, role_middleware_1.requireRoles)('ADMIN'), invitations_controller_1.invitationsController.revoke);
exports.invitationRoutes = router;

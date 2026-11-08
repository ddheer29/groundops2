"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationsController = exports.InvitationsController = void 0;
const invitations_service_1 = require("./invitations.service");
const response_util_1 = require("../../utils/response.util");
const app_error_1 = require("../../utils/app-error");
class InvitationsController {
    async create(req, res, next) {
        try {
            if (!req.user) {
                throw app_error_1.AppError.unauthorized('Authentication required');
            }
            const data = await invitations_service_1.invitationsService.createInvitation(req.user, req.body);
            (0, response_util_1.sendSuccess)(res, 'Invitation sent successfully', data, 201);
        }
        catch (err) {
            next(err);
        }
    }
    async verify(req, res, next) {
        try {
            const { token } = req.params;
            const data = await invitations_service_1.invitationsService.verifyInvitation(token);
            (0, response_util_1.sendSuccess)(res, 'Invitation token verified successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async resend(req, res, next) {
        try {
            if (!req.user) {
                throw app_error_1.AppError.unauthorized('Authentication required');
            }
            const { id } = req.params;
            const data = await invitations_service_1.invitationsService.resendInvitation(req.user, id);
            (0, response_util_1.sendSuccess)(res, 'Invitation resent successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async revoke(req, res, next) {
        try {
            if (!req.user) {
                throw app_error_1.AppError.unauthorized('Authentication required');
            }
            const { id } = req.params;
            const data = await invitations_service_1.invitationsService.revokeInvitation(req.user, id);
            (0, response_util_1.sendSuccess)(res, 'Invitation revoked successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
    async list(req, res, next) {
        try {
            if (!req.organisationId) {
                throw app_error_1.AppError.unauthorized('Organisation context missing');
            }
            const data = await invitations_service_1.invitationsService.listInvitations(req.organisationId);
            (0, response_util_1.sendSuccess)(res, 'Invitations retrieved successfully', data, 200);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.InvitationsController = InvitationsController;
exports.invitationsController = new InvitationsController();

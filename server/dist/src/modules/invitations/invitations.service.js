"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationsService = exports.InvitationsService = void 0;
const invitation_model_1 = require("../../models/invitation.model");
const user_model_1 = require("../../models/user.model");
const organisation_model_1 = require("../../models/organisation.model");
const crypto_util_1 = require("../../utils/crypto.util");
const app_error_1 = require("../../utils/app-error");
const email_service_1 = require("../../services/email/email.service");
const dto_mapper_1 = require("../../utils/dto.mapper");
class InvitationsService {
    async createInvitation(adminUser, data) {
        const cleanEmail = data.email.trim().toLowerCase();
        const targetRole = data.role || 'TECHNICIAN';
        // 1. Check if user already exists in this organisation
        const existingUser = await user_model_1.UserModel.findOne({
            email: cleanEmail,
            organisationId: adminUser.organisationId,
        });
        if (existingUser && existingUser.status === 'ACTIVE') {
            throw app_error_1.AppError.conflict(`User ${cleanEmail} is already an active member of this organisation.`);
        }
        // 2. Invalidate any older pending invitations for this email in this organisation
        await invitation_model_1.InvitationModel.updateMany({
            email: cleanEmail,
            organisationId: adminUser.organisationId,
            status: 'PENDING',
        }, { status: 'EXPIRED' });
        // 4. Ensure an invited User record exists so technicians can be tracked
        if (!existingUser) {
            await user_model_1.UserModel.create({
                email: cleanEmail,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                role: targetRole,
                organisationId: adminUser.organisationId,
                status: 'INVITED',
                emailVerified: false,
                invitedBy: adminUser._id,
            });
        }
        else {
            existingUser.firstName = data.firstName.trim();
            existingUser.lastName = data.lastName.trim();
            existingUser.role = targetRole;
            existingUser.invitedBy = adminUser._id;
            await existingUser.save();
        }
        // 5. Generate secure random invitation token and its SHA-256 hash
        const rawToken = (0, crypto_util_1.generateSecureToken)(32);
        const tokenHash = (0, crypto_util_1.hashToken)(rawToken);
        // 6. Set 72-hour expiry (3 days)
        const expiresHours = 72;
        const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
        const invitation = await invitation_model_1.InvitationModel.create({
            tokenHash,
            email: cleanEmail,
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            role: targetRole,
            organisationId: adminUser.organisationId,
            invitedBy: adminUser._id,
            expiresAt,
            status: 'PENDING',
        });
        // 7. Dispatch invitation email via Nodemailer
        const organisation = await organisation_model_1.OrganisationModel.findById(adminUser.organisationId);
        const orgName = organisation?.name || 'GroundOps';
        const inviterName = `${adminUser.firstName} ${adminUser.lastName}`.trim();
        await email_service_1.emailService.sendTechnicianInvitation({
            to: cleanEmail,
            technicianName: `${data.firstName} ${data.lastName}`.trim(),
            organisationName: orgName,
            inviterName,
            token: rawToken,
            expiresHours,
        });
        return (0, dto_mapper_1.toInvitationDto)(invitation);
    }
    async verifyInvitation(rawToken) {
        if (!rawToken || !rawToken.trim()) {
            throw new app_error_1.AppError(400, 'Invitation token is required', 'INVALID_TOKEN');
        }
        const tokenHash = (0, crypto_util_1.hashToken)(rawToken.trim());
        const invitation = await invitation_model_1.InvitationModel.findOne({ tokenHash });
        if (!invitation) {
            throw new app_error_1.AppError(404, 'Invalid or unrecognized invitation link', 'INVALID_TOKEN');
        }
        if (invitation.status === 'REVOKED') {
            throw new app_error_1.AppError(400, 'This invitation link has been revoked by your administrator', 'INVALID_TOKEN');
        }
        if (invitation.status === 'ACCEPTED') {
            throw new app_error_1.AppError(400, 'This invitation has already been accepted and the account is activated', 'INVALID_TOKEN');
        }
        if (new Date() > invitation.expiresAt) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            throw new app_error_1.AppError(400, 'This invitation link has expired. Please contact your company administrator for a new invite.', 'TOKEN_EXPIRED');
        }
        const organisation = await organisation_model_1.OrganisationModel.findById(invitation.organisationId);
        return {
            valid: true,
            firstName: invitation.firstName,
            email: invitation.email,
            organisationName: organisation?.name || 'GroundOps Organisation',
            expiresAt: invitation.expiresAt.toISOString(),
            role: invitation.role,
        };
    }
    async resendInvitation(adminUser, invitationId) {
        const invitation = await invitation_model_1.InvitationModel.findOne({
            _id: invitationId,
            organisationId: adminUser.organisationId,
        });
        if (!invitation) {
            throw app_error_1.AppError.notFound('Invitation not found');
        }
        if (invitation.status === 'ACCEPTED') {
            throw app_error_1.AppError.badRequest('Cannot resend an invitation that has already been accepted');
        }
        const rawToken = (0, crypto_util_1.generateSecureToken)(32);
        const tokenHash = (0, crypto_util_1.hashToken)(rawToken);
        const expiresHours = 72;
        const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
        invitation.tokenHash = tokenHash;
        invitation.expiresAt = expiresAt;
        invitation.status = 'PENDING';
        invitation.invitedBy = adminUser._id;
        await invitation.save();
        const organisation = await organisation_model_1.OrganisationModel.findById(adminUser.organisationId);
        const orgName = organisation?.name || 'GroundOps';
        const inviterName = `${adminUser.firstName} ${adminUser.lastName}`.trim();
        await email_service_1.emailService.sendTechnicianInvitation({
            to: invitation.email,
            technicianName: `${invitation.firstName} ${invitation.lastName}`.trim(),
            organisationName: orgName,
            inviterName,
            token: rawToken,
            expiresHours,
        });
        return (0, dto_mapper_1.toInvitationDto)(invitation);
    }
    async revokeInvitation(adminUser, invitationId) {
        const invitation = await invitation_model_1.InvitationModel.findOne({
            _id: invitationId,
            organisationId: adminUser.organisationId,
        });
        if (!invitation) {
            throw app_error_1.AppError.notFound('Invitation not found');
        }
        if (invitation.status === 'ACCEPTED') {
            throw app_error_1.AppError.badRequest('Cannot revoke an already accepted invitation');
        }
        invitation.status = 'REVOKED';
        await invitation.save();
        return (0, dto_mapper_1.toInvitationDto)(invitation);
    }
    async listInvitations(organisationId) {
        const invitations = await invitation_model_1.InvitationModel.find({
            organisationId,
        })
            .populate('invitedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        const now = new Date();
        return invitations.map(inv => {
            // Auto-detect expired state if not yet marked
            let status = inv.status;
            if (status === 'PENDING' && now > inv.expiresAt) {
                status = 'EXPIRED';
            }
            const inviterName = inv.invitedBy
                ? `${inv.invitedBy.firstName} ${inv.invitedBy.lastName}`.trim()
                : undefined;
            return {
                id: inv._id.toString(),
                email: inv.email,
                firstName: inv.firstName,
                lastName: inv.lastName,
                role: inv.role,
                status,
                expiresAt: inv.expiresAt.toISOString(),
                createdAt: inv.createdAt.toISOString(),
                inviterName,
            };
        });
    }
}
exports.InvitationsService = InvitationsService;
exports.invitationsService = new InvitationsService();

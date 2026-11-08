"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_model_1 = require("../../models/user.model");
const organisation_model_1 = require("../../models/organisation.model");
const invitation_model_1 = require("../../models/invitation.model");
const refresh_token_model_1 = require("../../models/refresh-token.model");
const crypto_util_1 = require("../../utils/crypto.util");
const jwt_util_1 = require("../../utils/jwt.util");
const app_error_1 = require("../../utils/app-error");
const dto_mapper_1 = require("../../utils/dto.mapper");
class AuthService {
    async login(req) {
        const cleanEmail = req.email.trim().toLowerCase();
        // Find user by normalised email
        const user = await user_model_1.UserModel.findOne({ email: cleanEmail });
        if (!user || !user.passwordHash) {
            throw app_error_1.AppError.unauthorized('Invalid work email or password');
        }
        // Verify password
        const isPasswordValid = await (0, crypto_util_1.comparePassword)(req.password, user.passwordHash);
        if (!isPasswordValid) {
            throw app_error_1.AppError.unauthorized('Invalid work email or password');
        }
        // Verify user status
        if (user.status !== 'ACTIVE') {
            throw new app_error_1.AppError(403, `Account is currently ${user.status.toLowerCase()}. Please contact your company administrator.`, 'ACCOUNT_DISABLED');
        }
        // Verify organisation status
        const organisation = await organisation_model_1.OrganisationModel.findById(user.organisationId);
        if (!organisation) {
            throw app_error_1.AppError.unauthorized('Associated organisation not found');
        }
        if (organisation.status !== 'ACTIVE') {
            throw new app_error_1.AppError(403, 'Organisation account is inactive. Please contact GroundOps support.', 'ORGANISATION_INACTIVE');
        }
        // Generate tokens
        const accessToken = (0, jwt_util_1.generateAccessToken)({
            userId: user._id.toString(),
            organisationId: organisation._id.toString(),
            role: user.role,
            email: user.email,
        });
        const tokenId = (0, crypto_util_1.generateSecureToken)(16);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)({
            userId: user._id.toString(),
            organisationId: organisation._id.toString(),
            tokenId,
        });
        // Save refresh token record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refresh_token_model_1.RefreshTokenModel.create({
            tokenHash: (0, crypto_util_1.hashToken)(refreshToken),
            userId: user._id,
            organisationId: organisation._id,
            expiresAt,
            isRevoked: false,
        });
        // Update lastLoginAt
        user.lastLoginAt = new Date();
        await user.save();
        return {
            accessToken,
            refreshToken,
            user: (0, dto_mapper_1.toUserSummaryDto)(user),
            organisation: (0, dto_mapper_1.toOrganisationSummaryDto)(organisation),
        };
    }
    async setPassword(req) {
        const rawToken = req.token.trim();
        const tokenHash = (0, crypto_util_1.hashToken)(rawToken);
        // Find invitation by token hash
        const invitation = await invitation_model_1.InvitationModel.findOne({ tokenHash });
        if (!invitation) {
            throw new app_error_1.AppError(400, 'Invalid or unrecognized invitation token', 'INVALID_TOKEN');
        }
        if (invitation.status === 'REVOKED') {
            throw new app_error_1.AppError(400, 'This invitation has been revoked by your administrator', 'INVALID_TOKEN');
        }
        if (invitation.status === 'ACCEPTED') {
            throw new app_error_1.AppError(400, 'This invitation token has already been used and activated', 'INVALID_TOKEN');
        }
        // Check expiry
        if (new Date() > invitation.expiresAt) {
            invitation.status = 'EXPIRED';
            await invitation.save();
            throw new app_error_1.AppError(400, 'This invitation link has expired. Please request a new invitation from your administrator.', 'TOKEN_EXPIRED');
        }
        // Find invited user
        const user = await user_model_1.UserModel.findOne({
            email: invitation.email,
            organisationId: invitation.organisationId,
        });
        if (!user) {
            throw app_error_1.AppError.notFound('Associated technician account could not be found');
        }
        // Hash password & activate user
        const passwordHash = await (0, crypto_util_1.hashPassword)(req.password);
        user.passwordHash = passwordHash;
        user.status = 'ACTIVE';
        user.emailVerified = true;
        user.lastLoginAt = new Date();
        await user.save();
        // Mark invitation accepted
        invitation.status = 'ACCEPTED';
        invitation.acceptedAt = new Date();
        await invitation.save();
        const organisation = await organisation_model_1.OrganisationModel.findById(invitation.organisationId);
        if (!organisation) {
            throw app_error_1.AppError.notFound('Associated organisation could not be found');
        }
        // Generate login tokens for immediate seamless login
        const accessToken = (0, jwt_util_1.generateAccessToken)({
            userId: user._id.toString(),
            organisationId: organisation._id.toString(),
            role: user.role,
            email: user.email,
        });
        const tokenId = (0, crypto_util_1.generateSecureToken)(16);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)({
            userId: user._id.toString(),
            organisationId: organisation._id.toString(),
            tokenId,
        });
        const refreshExpiry = new Date();
        refreshExpiry.setDate(refreshExpiry.getDate() + 7);
        await refresh_token_model_1.RefreshTokenModel.create({
            tokenHash: (0, crypto_util_1.hashToken)(refreshToken),
            userId: user._id,
            organisationId: organisation._id,
            expiresAt: refreshExpiry,
            isRevoked: false,
        });
        return {
            user: (0, dto_mapper_1.toUserSummaryDto)(user),
            organisation: (0, dto_mapper_1.toOrganisationSummaryDto)(organisation),
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(req) {
        const rawRefreshToken = req.refreshToken;
        let payload;
        try {
            payload = (0, jwt_util_1.verifyRefreshToken)(rawRefreshToken);
        }
        catch {
            throw new app_error_1.AppError(401, 'Invalid or expired refresh token', 'INVALID_TOKEN');
        }
        const hashedToken = (0, crypto_util_1.hashToken)(rawRefreshToken);
        const tokenRecord = await refresh_token_model_1.RefreshTokenModel.findOne({ tokenHash: hashedToken });
        if (!tokenRecord || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
            // Possible token reuse attempt: revoke all tokens for this user as a security measure
            if (tokenRecord && tokenRecord.isRevoked) {
                await refresh_token_model_1.RefreshTokenModel.updateMany({ userId: tokenRecord.userId }, { isRevoked: true });
            }
            throw new app_error_1.AppError(401, 'Refresh token has been revoked or expired', 'INVALID_TOKEN');
        }
        const user = await user_model_1.UserModel.findById(payload.userId);
        if (!user || user.status !== 'ACTIVE') {
            throw new app_error_1.AppError(403, 'Account is disabled or no longer exists', 'ACCOUNT_DISABLED');
        }
        const organisation = await organisation_model_1.OrganisationModel.findById(user.organisationId);
        if (!organisation || organisation.status !== 'ACTIVE') {
            throw new app_error_1.AppError(403, 'Organisation is inactive', 'ORGANISATION_INACTIVE');
        }
        // Issue new access and refresh token pair
        const newAccessToken = (0, jwt_util_1.generateAccessToken)({
            userId: user._id.toString(),
            organisationId: organisation._id.toString(),
            role: user.role,
            email: user.email,
        });
        const newTokenId = (0, crypto_util_1.generateSecureToken)(16);
        const newRefreshToken = (0, jwt_util_1.generateRefreshToken)({
            userId: user._id.toString(),
            organisationId: organisation._id.toString(),
            tokenId: newTokenId,
        });
        const newHashedToken = (0, crypto_util_1.hashToken)(newRefreshToken);
        // Invalidate old token & link to new token
        tokenRecord.isRevoked = true;
        tokenRecord.replacedByTokenHash = newHashedToken;
        await tokenRecord.save();
        // Save new refresh token record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refresh_token_model_1.RefreshTokenModel.create({
            tokenHash: newHashedToken,
            userId: user._id,
            organisationId: organisation._id,
            expiresAt,
            isRevoked: false,
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        if (refreshToken) {
            const hashed = (0, crypto_util_1.hashToken)(refreshToken);
            await refresh_token_model_1.RefreshTokenModel.updateOne({ tokenHash: hashed }, { isRevoked: true });
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();

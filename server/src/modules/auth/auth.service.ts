import {
  LoginRequest,
  LoginResponseData,
  SetPasswordRequest,
  SetPasswordResponseData,
  RefreshTokenRequest,
  RefreshTokenResponseData,
} from '@groundops/contracts';
import { UserModel } from '../../models/user.model';
import { OrganisationModel } from '../../models/organisation.model';
import { InvitationModel } from '../../models/invitation.model';
import { RefreshTokenModel } from '../../models/refresh-token.model';
import { comparePassword, hashPassword, hashToken, generateSecureToken } from '../../utils/crypto.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.util';
import { AppError } from '../../utils/app-error';
import { toOrganisationSummaryDto, toUserSummaryDto } from '../../utils/dto.mapper';

export class AuthService {
  public async login(req: LoginRequest): Promise<LoginResponseData> {
    const cleanEmail = req.email.trim().toLowerCase();

    // Find user by normalised email
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid work email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(req.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid work email or password');
    }

    // Verify user status
    if (user.status !== 'ACTIVE') {
      throw new AppError(
        403,
        `Account is currently ${user.status.toLowerCase()}. Please contact your company administrator.`,
        'ACCOUNT_DISABLED'
      );
    }

    // Verify organisation status
    const organisation = await OrganisationModel.findById(user.organisationId);
    if (!organisation) {
      throw AppError.unauthorized('Associated organisation not found');
    }

    if (organisation.status !== 'ACTIVE') {
      throw new AppError(
        403,
        'Organisation account is inactive. Please contact GroundOps support.',
        'ORGANISATION_INACTIVE'
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      organisationId: organisation._id.toString(),
      role: user.role,
      email: user.email,
    });

    const tokenId = generateSecureToken(16);
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      organisationId: organisation._id.toString(),
      tokenId,
    });

    // Save refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshTokenModel.create({
      tokenHash: hashToken(refreshToken),
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
      user: toUserSummaryDto(user),
      organisation: toOrganisationSummaryDto(organisation),
    };
  }

  public async setPassword(req: SetPasswordRequest): Promise<SetPasswordResponseData> {
    const rawToken = req.token.trim();
    const tokenHash = hashToken(rawToken);

    // Find invitation by token hash
    const invitation = await InvitationModel.findOne({ tokenHash });
    if (!invitation) {
      throw new AppError(400, 'Invalid or unrecognized invitation token', 'INVALID_TOKEN');
    }

    if (invitation.status === 'REVOKED') {
      throw new AppError(400, 'This invitation has been revoked by your administrator', 'INVALID_TOKEN');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new AppError(400, 'This invitation token has already been used and activated', 'INVALID_TOKEN');
    }

    // Check expiry
    if (new Date() > invitation.expiresAt) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new AppError(400, 'This invitation link has expired. Please request a new invitation from your administrator.', 'TOKEN_EXPIRED');
    }

    // Find invited user
    const user = await UserModel.findOne({
      email: invitation.email,
      organisationId: invitation.organisationId,
    });

    if (!user) {
      throw AppError.notFound('Associated technician account could not be found');
    }

    // Hash password & activate user
    const passwordHash = await hashPassword(req.password);
    user.passwordHash = passwordHash;
    user.status = 'ACTIVE';
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    // Mark invitation accepted
    invitation.status = 'ACCEPTED';
    invitation.acceptedAt = new Date();
    await invitation.save();

    const organisation = await OrganisationModel.findById(invitation.organisationId);
    if (!organisation) {
      throw AppError.notFound('Associated organisation could not be found');
    }

    // Generate login tokens for immediate seamless login
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      organisationId: organisation._id.toString(),
      role: user.role,
      email: user.email,
    });

    const tokenId = generateSecureToken(16);
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      organisationId: organisation._id.toString(),
      tokenId,
    });

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await RefreshTokenModel.create({
      tokenHash: hashToken(refreshToken),
      userId: user._id,
      organisationId: organisation._id,
      expiresAt: refreshExpiry,
      isRevoked: false,
    });

    return {
      user: toUserSummaryDto(user),
      organisation: toOrganisationSummaryDto(organisation),
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(req: RefreshTokenRequest): Promise<RefreshTokenResponseData> {
    const rawRefreshToken = req.refreshToken;

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_TOKEN');
    }

    const hashedToken = hashToken(rawRefreshToken);
    const tokenRecord = await RefreshTokenModel.findOne({ tokenHash: hashedToken });

    if (!tokenRecord || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
      // Possible token reuse attempt: revoke all tokens for this user as a security measure
      if (tokenRecord && tokenRecord.isRevoked) {
        await RefreshTokenModel.updateMany({ userId: tokenRecord.userId }, { isRevoked: true });
      }
      throw new AppError(401, 'Refresh token has been revoked or expired', 'INVALID_TOKEN');
    }

    const user = await UserModel.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(403, 'Account is disabled or no longer exists', 'ACCOUNT_DISABLED');
    }

    const organisation = await OrganisationModel.findById(user.organisationId);
    if (!organisation || organisation.status !== 'ACTIVE') {
      throw new AppError(403, 'Organisation is inactive', 'ORGANISATION_INACTIVE');
    }

    // Issue new access and refresh token pair
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      organisationId: organisation._id.toString(),
      role: user.role,
      email: user.email,
    });

    const newTokenId = generateSecureToken(16);
    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      organisationId: organisation._id.toString(),
      tokenId: newTokenId,
    });

    const newHashedToken = hashToken(newRefreshToken);

    // Invalidate old token & link to new token
    tokenRecord.isRevoked = true;
    tokenRecord.replacedByTokenHash = newHashedToken;
    await tokenRecord.save();

    // Save new refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshTokenModel.create({
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

  public async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await RefreshTokenModel.updateOne({ tokenHash: hashed }, { isRevoked: true });
    }
  }
}

export const authService = new AuthService();

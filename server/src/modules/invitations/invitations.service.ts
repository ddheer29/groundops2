import {
  CreateInvitationRequest,
  Invitation,
  InvitationListItem,
  VerifyInvitationResponse,
} from '@groundops/contracts';
import { InvitationModel } from '../../models/invitation.model';
import { UserModel, IUserDocument } from '../../models/user.model';
import { OrganisationModel } from '../../models/organisation.model';
import { generateSecureToken, hashToken } from '../../utils/crypto.util';
import { AppError } from '../../utils/app-error';
import { emailService } from '../../services/email/email.service';
import { toInvitationDto, toInvitationListItemDto } from '../../utils/dto.mapper';

export class InvitationsService {
  public async createInvitation(
    adminUser: IUserDocument,
    data: CreateInvitationRequest
  ): Promise<Invitation> {
    const cleanEmail = data.email.trim().toLowerCase();
    const targetRole = data.role || 'TECHNICIAN';

    // 1. Check if user already exists in this organisation
    const existingUser = await UserModel.findOne({
      email: cleanEmail,
      organisationId: adminUser.organisationId,
    });

    if (existingUser && existingUser.status === 'ACTIVE') {
      throw AppError.conflict(
        `User ${cleanEmail} is already an active member of this organisation.`
      );
    }

    // 2. Invalidate any older pending invitations for this email in this organisation
    await InvitationModel.updateMany(
      {
        email: cleanEmail,
        organisationId: adminUser.organisationId,
        status: 'PENDING',
      },
      { status: 'EXPIRED' }
    );

    // 4. Ensure an invited User record exists so technicians can be tracked
    if (!existingUser) {
      await UserModel.create({
        email: cleanEmail,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: targetRole,
        organisationId: adminUser.organisationId,
        status: 'INVITED',
        emailVerified: false,
        invitedBy: adminUser._id,
      });
    } else {
      existingUser.firstName = data.firstName.trim();
      existingUser.lastName = data.lastName.trim();
      existingUser.role = targetRole;
      existingUser.invitedBy = adminUser._id;
      await existingUser.save();
    }

    // 5. Generate secure random invitation token and its SHA-256 hash
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    // 6. Set 72-hour expiry (3 days)
    const expiresHours = 72;
    const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

    const invitation = await InvitationModel.create({
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
    const organisation = await OrganisationModel.findById(adminUser.organisationId);
    const orgName = organisation?.name || 'GroundOps';
    const inviterName = `${adminUser.firstName} ${adminUser.lastName}`.trim();

    await emailService.sendTechnicianInvitation({
      to: cleanEmail,
      technicianName: `${data.firstName} ${data.lastName}`.trim(),
      organisationName: orgName,
      inviterName,
      token: rawToken,
      expiresHours,
    });

    return toInvitationDto(invitation);
  }

  public async verifyInvitation(rawToken: string): Promise<VerifyInvitationResponse> {
    if (!rawToken || !rawToken.trim()) {
      throw new AppError(400, 'Invitation token is required', 'INVALID_TOKEN');
    }

    const tokenHash = hashToken(rawToken.trim());
    const invitation = await InvitationModel.findOne({ tokenHash });

    if (!invitation) {
      throw new AppError(404, 'Invalid or unrecognized invitation link', 'INVALID_TOKEN');
    }

    if (invitation.status === 'REVOKED') {
      throw new AppError(
        400,
        'This invitation link has been revoked by your administrator',
        'INVALID_TOKEN'
      );
    }

    if (invitation.status === 'ACCEPTED') {
      throw new AppError(
        400,
        'This invitation has already been accepted and the account is activated',
        'INVALID_TOKEN'
      );
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new AppError(
        400,
        'This invitation link has expired. Please contact your company administrator for a new invite.',
        'TOKEN_EXPIRED'
      );
    }

    const organisation = await OrganisationModel.findById(invitation.organisationId);

    return {
      valid: true,
      firstName: invitation.firstName,
      email: invitation.email,
      organisationName: organisation?.name || 'GroundOps Organisation',
      expiresAt: invitation.expiresAt.toISOString(),
      role: invitation.role,
    };
  }

  public async resendInvitation(
    adminUser: IUserDocument,
    invitationId: string
  ): Promise<Invitation> {
    const invitation = await InvitationModel.findOne({
      _id: invitationId,
      organisationId: adminUser.organisationId,
    });

    if (!invitation) {
      throw AppError.notFound('Invitation not found');
    }

    if (invitation.status === 'ACCEPTED') {
      throw AppError.badRequest('Cannot resend an invitation that has already been accepted');
    }

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresHours = 72;
    const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

    invitation.tokenHash = tokenHash;
    invitation.expiresAt = expiresAt;
    invitation.status = 'PENDING';
    invitation.invitedBy = adminUser._id;
    await invitation.save();

    const organisation = await OrganisationModel.findById(adminUser.organisationId);
    const orgName = organisation?.name || 'GroundOps';
    const inviterName = `${adminUser.firstName} ${adminUser.lastName}`.trim();

    await emailService.sendTechnicianInvitation({
      to: invitation.email,
      technicianName: `${invitation.firstName} ${invitation.lastName}`.trim(),
      organisationName: orgName,
      inviterName,
      token: rawToken,
      expiresHours,
    });

    return toInvitationDto(invitation);
  }

  public async revokeInvitation(
    adminUser: IUserDocument,
    invitationId: string
  ): Promise<Invitation> {
    const invitation = await InvitationModel.findOne({
      _id: invitationId,
      organisationId: adminUser.organisationId,
    });

    if (!invitation) {
      throw AppError.notFound('Invitation not found');
    }

    if (invitation.status === 'ACCEPTED') {
      throw AppError.badRequest('Cannot revoke an already accepted invitation');
    }

    invitation.status = 'REVOKED';
    await invitation.save();

    return toInvitationDto(invitation);
  }

  public async listInvitations(organisationId: string): Promise<InvitationListItem[]> {
    const invitations = await InvitationModel.find({
      organisationId,
    })
      .populate<{ invitedBy: IUserDocument }>('invitedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const now = new Date();

    return invitations.map(inv => {
      // Auto-detect expired state if not yet marked
      let status = inv.status;
      if (status === 'PENDING' && now > inv.expiresAt) {
        status = 'EXPIRED';
      }

      const inviterName = inv.invitedBy
        ? `${(inv.invitedBy as any).firstName} ${(inv.invitedBy as any).lastName}`.trim()
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

export const invitationsService = new InvitationsService();

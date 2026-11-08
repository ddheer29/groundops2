import { Request, Response, NextFunction } from 'express';
import { invitationsService } from './invitations.service';
import { sendSuccess } from '../../utils/response.util';
import { AppError } from '../../utils/app-error';

export class InvitationsController {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }
      const data = await invitationsService.createInvitation(req.user, req.body);
      sendSuccess(res, 'Invitation sent successfully', data, 201);
    } catch (err) {
      next(err);
    }
  }

  public async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const data = await invitationsService.verifyInvitation(token);
      sendSuccess(res, 'Invitation token verified successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async resend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }
      const { id } = req.params;
      const data = await invitationsService.resendInvitation(req.user, id);
      sendSuccess(res, 'Invitation resent successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Authentication required');
      }
      const { id } = req.params;
      const data = await invitationsService.revokeInvitation(req.user, id);
      sendSuccess(res, 'Invitation revoked successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.organisationId) {
        throw AppError.unauthorized('Organisation context missing');
      }
      const data = await invitationsService.listInvitations(req.organisationId);
      sendSuccess(res, 'Invitations retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const invitationsController = new InvitationsController();

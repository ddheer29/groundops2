import { Request, Response, NextFunction } from 'express';
import { organisationsService } from './organisations.service';
import { sendSuccess } from '../../utils/response.util';
import { AppError } from '../../utils/app-error';

export class OrganisationsController {
  public async getMyOrganisation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.organisationId) {
        throw AppError.unauthorized('Organisation context missing');
      }
      const data = await organisationsService.getMyOrganisation(req.organisationId);
      sendSuccess(res, 'Organisation details retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.organisationId) {
        throw AppError.unauthorized('Organisation context missing');
      }
      const data = await organisationsService.getStats(req.organisationId);
      sendSuccess(res, 'Organisation statistics retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const organisationsController = new OrganisationsController();

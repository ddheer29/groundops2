import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../utils/response.util';
import { AppError } from '../../utils/app-error';

export class UsersController {
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        throw AppError.unauthorized('User not authenticated');
      }
      const data = await usersService.getProfile(req.userId);
      sendSuccess(res, 'User profile retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async listTechnicians(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.organisationId) {
        throw AppError.unauthorized('Organisation context missing');
      }
      const data = await usersService.listTechnicians(req.organisationId);
      sendSuccess(res, 'Technicians retrieved successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();

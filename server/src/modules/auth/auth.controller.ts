import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response.util';

export class AuthController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await authService.login(req.body);
      sendSuccess(res, 'Login successful', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async setPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await authService.setPassword(req.body);
      sendSuccess(res, 'Password set and account activated successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await authService.refreshToken(req.body);
      sendSuccess(res, 'Token refreshed successfully', data, 200);
    } catch (err) {
      next(err);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req.body?.refreshToken);
      sendSuccess(res, 'Logged out successfully', null, 200);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

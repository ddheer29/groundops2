import { Router } from 'express';
import {
  LoginRequestSchema,
  SetPasswordRequestSchema,
  RefreshTokenRequestSchema,
  LogoutRequestSchema,
} from '@groundops/contracts';
import { authController } from './auth.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

router.post(
  '/login',
  authLimiter,
  validateBody(LoginRequestSchema),
  authController.login
);

router.post(
  '/set-password',
  authLimiter,
  validateBody(SetPasswordRequestSchema),
  authController.setPassword
);

router.post(
  '/refresh-token',
  validateBody(RefreshTokenRequestSchema),
  authController.refreshToken
);

router.post(
  '/logout',
  validateBody(LogoutRequestSchema),
  authController.logout
);

export const authRoutes = router;

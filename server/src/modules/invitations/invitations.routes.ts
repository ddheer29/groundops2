import { Router } from 'express';
import { CreateInvitationRequestSchema } from '@groundops/contracts';
import { invitationsController } from './invitations.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/role.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { invitationLimiter } from '../../middleware/rate-limit.middleware';

const router = Router();

// Public route: Verify invitation token
router.get('/verify/:token', invitationsController.verify);

// Protected routes (Admin / Manager only)
router.use(authenticate);

router.post(
  '/',
  requireRoles('ADMIN'),
  invitationLimiter,
  validateBody(CreateInvitationRequestSchema),
  invitationsController.create
);

router.get(
  '/',
  requireRoles('ADMIN', 'MANAGER'),
  invitationsController.list
);

router.post(
  '/:id/resend',
  requireRoles('ADMIN'),
  invitationLimiter,
  invitationsController.resend
);

router.post(
  '/:id/revoke',
  requireRoles('ADMIN'),
  invitationsController.revoke
);

export const invitationRoutes = router;

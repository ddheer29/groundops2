import { Router } from 'express';
import { organisationsController } from './organisations.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/my', organisationsController.getMyOrganisation);
router.get('/stats', requireRoles('ADMIN', 'MANAGER'), organisationsController.getStats);

export const organisationRoutes = router;

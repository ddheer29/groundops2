import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.get('/technicians', requireRoles('ADMIN', 'MANAGER'), usersController.listTechnicians);

export const usersRoutes = router;

// routes/role.routes.ts
import { Router } from 'express';
import { RoleController } from '../controller/RoleController';
import { authenticate } from '../middleware/authentication';
import { authorize } from '../middleware/authorization';

const router = Router();
const controller = new RoleController();

// All role routes are protected and require admin access
router.get('/', authenticate, authorize(['admin']), controller.getAll);
router.get('/:id', authenticate, authorize(['admin']), controller.getOne);
router.post('/', authenticate, authorize(['admin']), controller.create);
router.put('/:id', authenticate, authorize(['admin']), controller.update);
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);
router.post('/:id/permissions/:permissionId', authenticate, authorize(['admin']), controller.addPermission);
router.delete('/:id/permissions/:permissionId', authenticate, authorize(['admin']), controller.removePermission);

export default router;

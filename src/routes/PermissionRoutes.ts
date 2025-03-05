// routes/permission.routes.ts
import { Router } from 'express';
import { PermissionController } from '../controller/PermissionController';
import { authenticate } from '../middleware/authentication';
import { authorize } from '../middleware/authorization';

const router = Router();
const controller = new PermissionController();

// All permission routes are protected and require admin access
router.get('/', authenticate, authorize(['admin']), controller.getAll);
router.get('/:id', authenticate, authorize(['admin']), controller.getOne);
router.post('/', authenticate, authorize(['admin']), controller.create);
router.put('/:id', authenticate, authorize(['admin']), controller.update);
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);

export default router;
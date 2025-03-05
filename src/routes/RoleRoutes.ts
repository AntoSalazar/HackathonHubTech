// routes/role.routes.ts
import { Router } from 'express';
import { RoleController } from '../controller/RoleController';

const router = Router();
const controller = new RoleController();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/permissions/:permissionId', controller.addPermission);
router.delete('/:id/permissions/:permissionId', controller.removePermission);

export default router;

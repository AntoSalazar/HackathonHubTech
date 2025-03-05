// routes/permission.routes.ts
import { Router } from 'express';
import { PermissionController } from '../controller/PermissionController';

const router = Router();
const controller = new PermissionController();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
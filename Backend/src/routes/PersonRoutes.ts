// routes/person.routes.ts
import { Router } from 'express';
import { PersonController } from '../controller/PersonController';
import { authenticate } from '../middleware/authentication';
import { authorize } from '../middleware/authorization';

const router = Router();
const controller = new PersonController();



// Protected routes
router.get('/', authenticate, authorize(['admin']), controller.getAll);
router.get('/:id', authenticate, authorize(['admin', 'user']), controller.getOne);
router.post('/', authenticate, authorize(['admin']), controller.create);
router.put('/:id', authenticate, authorize(['admin', 'user']), controller.update);
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);
router.post('/:id/roles/:roleId', authenticate, authorize(['admin']), controller.addRole);
router.delete('/:id/roles/:roleId', authenticate, authorize(['admin']), controller.removeRole);

export default router;

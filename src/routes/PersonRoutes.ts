// routes/person.routes.ts
import { Router } from 'express';
import { PersonController } from '../controller/PersonController';

const router = Router();
const controller = new PersonController();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/roles/:roleId', controller.addRole);
router.delete('/:id/roles/:roleId', controller.removeRole);

export default router;

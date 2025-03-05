// routes/category.routes.ts
import { Router } from 'express';
import { CategoryController } from '../controller/CategoryController';

const router = Router();
const controller = new CategoryController();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;

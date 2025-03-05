// routes/category.routes.ts
import { Router } from 'express';
import { CategoryController } from '../controller/CategoryController';
import { authenticate } from '../middleware/authentication';
import { authorize } from '../middleware/authorization';

const router = Router();
const controller = new CategoryController();

// Public routes 
router.get('/', controller.getAll); // Public access to categories list
router.get('/:id', controller.getOne); // Public access to view a category

// Protected routes requiring admin access
router.post('/', authenticate, authorize(['admin']), controller.create);
router.put('/:id', authenticate, authorize(['admin']), controller.update);
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);

export default router;

import { Router } from 'express';
import categoryRoutes from './CategoryRoutes';
import roleRoutes from './RoleRoutes';
import permissionRoutes from './PermissionRoutes';
import personRoutes from './PersonRoutes';
import authRoutes from './AuthRoutes';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/persons', personRoutes);
router.use('/auth', authRoutes);

export default router;
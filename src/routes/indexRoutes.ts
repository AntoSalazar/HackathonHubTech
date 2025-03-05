import { Router } from 'express';
import categoryRoutes from './CategoryRoutes';
import roleRoutes from './RoleRoutes';
import permissionRoutes from './PermissionRoutes';
import personRoutes from './PersonRoutes';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/persons', personRoutes);

export default router;
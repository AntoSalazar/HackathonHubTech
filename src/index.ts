import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import * as morgan from 'morgan'
import { port } from "./config"
import { validationResult } from "express-validator"

// Import routes
import categoryRoutes from "./routes/CategoryRoutes"
import roleRoutes from "./routes/RoleRoutes"
import permissionRoutes from "./routes/PermissionRoutes"
import personRoutes from "./routes/PersonRoutes"
import authRoutes from "./routes/AuthRoutes" // New auth routes

// Import entity classes to ensure they're registered 
import { Category } from "./entity/Category"
import { Role } from "./entity/Role"
import { Permission } from "./entity/Permission"
import { Person } from "./entity/Person"

function handleError(err, req, res, next) {
    console.error(err);
    res.status(err.statusCode || 500).send({ message: err.message })
}

AppDataSource.initialize().then(async () => {
    // create express app
    const app = express()
    app.use(morgan('tiny'))
    app.use(bodyParser.json())

    // Use validation middleware for the routes
    const validationMiddleware = async (req: Request, res: Response, next: Function) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        } catch (error) {
            next(error);
        }
    };

    // Register the routes
    app.use('/api/categories', validationMiddleware, categoryRoutes);
    app.use('/api/roles', validationMiddleware, roleRoutes);
    app.use('/api/permissions', validationMiddleware, permissionRoutes);
    app.use('/api/persons', validationMiddleware, personRoutes);
    app.use('/api/auth', validationMiddleware, authRoutes); // New auth routes

    // Global error handler
    app.use(handleError)
    
    // Start the server
    app.listen(port)
    console.log(`Express server has started on port ${port}.`)

    // Create default roles and permissions
    await createDefaultRoles();

}).catch(error => console.log(error))

// Function to create default roles and permissions
async function createDefaultRoles() {
    try {
        const roleRepository = AppDataSource.getRepository(Role);
        const permissionRepository = AppDataSource.getRepository(Permission);

        // Create admin role if it doesn't exist
        let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = new Role();
            adminRole.name = 'admin';
            await roleRepository.save(adminRole);
            console.log('Created admin role');
        }

        // Create user role if it doesn't exist
        let userRole = await roleRepository.findOne({ where: { name: 'user' } });
        if (!userRole) {
            userRole = new Role();
            userRole.name = 'user';
            await roleRepository.save(userRole);
            console.log('Created user role');
        }

        // Create basic permissions
        const basicPermissions = [
            'view_profile',
            'edit_profile',
            'view_users',
            'create_user',
            'edit_user',
            'delete_user',
            'manage_roles',
            'manage_permissions'
        ];

        for (const permName of basicPermissions) {
            let permission = await permissionRepository.findOne({ where: { name: permName } });
            if (!permission) {
                permission = new Permission();
                permission.name = permName;
                await permissionRepository.save(permission);
                console.log(`Created permission: ${permName}`);
            }
        }

        // Assign all permissions to admin role
        adminRole = await roleRepository.findOne({ 
            where: { name: 'admin' },
            relations: ['permissions'] 
        });

        const allPermissions = await permissionRepository.find();
        
        if (adminRole) {
            // Only add permissions that aren't already assigned
            const existingPermissionIds = adminRole.permissions?.map(p => p.id) || [];
            const permissionsToAdd = allPermissions.filter(p => !existingPermissionIds.includes(p.id));
            
            if (permissionsToAdd.length > 0) {
                adminRole.permissions = [...(adminRole.permissions || []), ...permissionsToAdd];
                await roleRepository.save(adminRole);
                console.log('Assigned all permissions to admin role');
            }
        }

        // Assign basic permissions to user role
        userRole = await roleRepository.findOne({ 
            where: { name: 'user' },
            relations: ['permissions'] 
        });

        const userPermissions = await permissionRepository.find({
            where: [
                { name: 'view_profile' },
                { name: 'edit_profile' }
            ]
        });
        
        if (userRole) {
            // Only add permissions that aren't already assigned
            const existingPermissionIds = userRole.permissions?.map(p => p.id) || [];
            const permissionsToAdd = userPermissions.filter(p => !existingPermissionIds.includes(p.id));
            
            if (permissionsToAdd.length > 0) {
                userRole.permissions = [...(userRole.permissions || []), ...permissionsToAdd];
                await roleRepository.save(userRole);
                console.log('Assigned basic permissions to user role');
            }
        }
    } catch (error) {
        console.error('Error creating default roles:', error);
    }
}
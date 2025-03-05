import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import * as morgan from 'morgan'
import { port } from "./config"
import { validationResult } from "express-validator"

// Import new routes
import categoryRoutes from "./routes/CategoryRoutes"
import roleRoutes from "./routes/RoleRoutes"
import permissionRoutes from "./routes/PermissionRoutes"
import personRoutes from "./routes/PersonRoutes"

// Import entity classes to ensure they're registered with TypeORM
import { Category } from "./entity/Category"
import { Role } from "./entity/Role"
import { Permission } from "./entity/Permission"
import { Person } from "./entity/Person"

function handleError(err, req, res, next) {
    res.status(err.statusCode || 500).send({ message: err.message })
}

AppDataSource.initialize().then(async () => {
    // create express app
    const app = express()
    app.use(morgan('tiny'))
    app.use(bodyParser.json())

    // Use validation middleware for the new routes
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

    // Register the new routes
    app.use('/api/categories', validationMiddleware, categoryRoutes);
    app.use('/api/roles', validationMiddleware, roleRoutes);
    app.use('/api/permissions', validationMiddleware, permissionRoutes);
    app.use('/api/persons', validationMiddleware, personRoutes);

    // Global error handler
    app.use(handleError)
    
    // Start the server
    app.listen(port)
    console.log(`Express server has started on port ${port}.`)

}).catch(error => console.log(error))
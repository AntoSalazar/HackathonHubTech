import "reflect-metadata"
import { DataSource } from "typeorm"
import { Category } from "./entity/Category"
import { Permission } from "./entity/Permission"
import { Person } from "./entity/Person"
import { Role } from "./entity/Role"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [Category,Permission,Person,Role],
    migrations: [],
    subscribers: [],
})

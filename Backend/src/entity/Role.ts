// role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Person } from "./Person";
import { Permission } from "./Permission";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Person, person => person.roles)
    persons: Person[];

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable({
        name: "role_permissions",
        joinColumn: {
            name: "role_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "permission_id",
            referencedColumnName: "id"
        }
    })
    permissions: Permission[];
}
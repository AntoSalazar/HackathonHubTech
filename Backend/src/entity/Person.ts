import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Category } from "./Category";
import { Role } from "./Role";

@Entity("person")
export class Person {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    picture: string;

    @Column({ type: "bytea" })
    biometric_fingerprint: Buffer;

    @Column({ nullable: true })
    category_id: number;

    @OneToOne(() => Category)
    @JoinColumn({ name: "category_id" })
    category: Category;

    @ManyToMany(() => Role, role => role.persons)
    @JoinTable({
        name: "person_roles",
        joinColumn: {
            name: "person_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "role_id",
            referencedColumnName: "id"
        }
    })
    roles: Role[];
}
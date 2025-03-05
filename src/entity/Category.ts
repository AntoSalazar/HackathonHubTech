import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Person } from "./Person";

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToOne(() => Person, person => person.category)
    person: Person;
}
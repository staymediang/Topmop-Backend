import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Service } from "./Service";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: "user" })
    role: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Service, (service) => service.createdBy)
    services: Service[];
}

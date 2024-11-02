import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User"; // Admin model

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column("text")
  description: string;

  @Column({ nullable: true }) // Allows null if no image is uploaded
  imageUrl: string; // Store image path/URL

  @ManyToOne(() => User, (user) => user.services, { nullable: true, eager: false }) // Updated relation
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
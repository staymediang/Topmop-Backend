import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Service } from "./Service";
import { Booking } from './Booking';

type UserRole = "user" | "admin" | "super admin" | "booking_manager";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 15, nullable: true })
  phoneNumber: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column()
  password: string;

  @Column({ default: "user" }) // Default role
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Service, (service) => service.createdBy)
  services: Service[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from './User';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 50 })
    frequency: string;

    @Column('int')
    hoursRequired: number;

    @Column('varchar', { length: 20, nullable: true })
    preferredDay: string;

    @Column('varchar', { length: 20, nullable: true })
    preferredTime: string;

    @Column({ type: 'boolean', default: false })
    meetCleanerFirst: boolean;

    @Column('date', { nullable: true })
    cleaningStartDate: Date;

    @Column({ type: 'boolean', default: false })
    needsIroning: boolean;

    @Column('text', { nullable: true })
    accessInstructions: string;

    @Column('text', { nullable: true })
    additionalInfo: string;

    @Column('varchar', { length: 100, nullable: true })
    referralSource: string;

    // Personal Details
    @Column('varchar', { length: 100, nullable: true })
    firstName: string;

    @Column('varchar', { length: 100, nullable: true })
    lastName: string;

    @Column('varchar', { length: 15, nullable: true })
    contactNumber: string;

    @Column('varchar', { length: 100, nullable: true })
    email: string;

    @Column('text', { nullable: true })
    address: string;

    @Column('varchar', { length: 50, nullable: true })
    city: string;

    @Column('varchar', { length: 20, nullable: true })
    postalCode: string;

    // Payment Details
    @Column('varchar', { length: 20 })
    paymentType: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.bookings, { nullable: false })
    user: User;
}

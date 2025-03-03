import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { User } from './User';

export class Address {
    @Column('varchar', { length: 100, nullable: true })
    street: string;

    @Column('varchar', { length: 50, nullable: true })
    number: string;

    @Column('varchar', { length: 50, nullable: true })
    city: string;

    @Column('varchar', { length: 20, nullable: true })
    postalCode: string;
}

export enum BookingStatus {
    NEW = 'new',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 50 })
    frequency: string;

    @Column('int')
    hoursRequired: number;

    @Column('simple-array', { nullable: true })
    preferredDays: string[];

    @Column('varchar', { length: 10, nullable: true })
    preferredTimes: string;

    @Column('date', { nullable: true })
    cleaningStartDate: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    paymentReference: string | null; // Can be null for cash payments
    
    @Column({ type: 'varchar', length: 20, default: 'pending' }) // pending, paid, failed
    paymentStatus: string;
    
    @Column({ type: 'varchar', length: 20, default: 'stripe' }) // stripe, cash, card
    paymentType: string;
    

    @Column({ type: 'boolean', default: false })
    needsIroning: boolean;

    @Column('text', { nullable: true })
    accessInstructions: string;

    @Column('text', { nullable: true })
    additionalInfo: string;

    @Column('varchar', { length: 100, nullable: true })
    referralSource: string;

    // Personal Details
    @Column('varchar', { length: 20, nullable: true })
    title: string;

    @Column('varchar', { length: 100, nullable: true })
    firstName: string;

    @Column('varchar', { length: 100, nullable: true })
    lastName: string;

    @Column('varchar', { length: 15, nullable: true })
    contactNumber: string;

    @Column('varchar', { length: 100, nullable: true })
    email: string;

    @Column(() => Address) // Embedding Address (no separate table)
    address: Address;

    // Booking Details
    @Column('varchar', { length: 50, nullable: true })
    dirtLevel: string;

    @Column('text', { nullable: true })
    roomSelection: string;

    @Column('text', { nullable: true })
    additionalServices: string;

    // Payment Details
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    // Booking Status
    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.NEW,
    })
    status: BookingStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.bookings, { nullable: false })
    user: User;
}

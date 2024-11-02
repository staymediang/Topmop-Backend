import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { length: 50 })
    frequency: string; // e.g., 'Weekly', 'Fortnightly', 'One-time'

    @Column('int')
    hoursRequired: number;

    @Column('varchar', { length: 20, nullable: true })
    preferredDay: string; // e.g., 'Monday', 'Tuesday'

    @Column('varchar', { length: 20, nullable: true })
    preferredTime: string; // e.g., 'Morning', 'Afternoon'

    // Requirements
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
    @Column('varchar', { length: 100 })
    firstName: string;

    @Column('varchar', { length: 100 })
    lastName: string;

    @Column('varchar', { length: 15 })
    contactNumber: string;

    @Column('varchar', { length: 100 })
    email: string;

    @Column('text')
    address: string;

    @Column('varchar', { length: 50 })
    city: string;

    @Column('varchar', { length: 20, nullable: true })
    postalCode: string;

    // Payment Details
    @Column('varchar', { length: 20 })
    paymentType: string; // e.g., 'card' or 'bank transfer'

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

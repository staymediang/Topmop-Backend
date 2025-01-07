import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('text')
    message: string;

    @Column('boolean', { default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}

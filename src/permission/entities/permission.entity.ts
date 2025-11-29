// permission.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    resource?: string; // ej: 'users', 'posts', 'orders'

    @Column({ nullable: true })
    action?: string; // ej: 'create', 'read', 'update', 'delete'

    @Column({ default: true })
    isActive: boolean;

    // Relación Many-to-Many con Role
    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

// role.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Permission } from '../../permission/entities/permission.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ default: true })
    isActive: boolean;

    // Relación Many-to-Many con User
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    // Relación Many-to-Many con Permission
    @ManyToMany(() => Permission, (permission) => permission.roles, {
        eager: true,
    })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id',
        },
    })
    permissions: Permission[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Método helper para verificar si tiene un permiso específico
    hasPermission(permissionName: string): boolean {
        return (
            this.permissions?.some(
                (permission) => permission.name === permissionName
            ) || false
        );
    }
}

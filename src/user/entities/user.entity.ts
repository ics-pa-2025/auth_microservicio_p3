import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    fullname: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true, default: null })
    refreshTokenHash?: string | null;

    // Relación Many-to-Many con Role
    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({
        name: 'user_roles',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
    })
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Método helper para verificar si tiene un rol específico
    hasRole(roleName: string): boolean {
        return this.roles?.some((role) => role.name === roleName) || false;
    }

    // Método helper para obtener todos los permisos del usuario
    getAllPermissions(): string[] {
        if (!this.roles) return [];

        const permissions = new Set<string>();
        this.roles.forEach((role) => {
            role.permissions?.forEach((permission) => {
                permissions.add(permission.name);
            });
        });

        return Array.from(permissions);
    }

    // Método helper para verificar si tiene un permiso específico
    hasPermission(permissionName: string): boolean {
        return this.getAllPermissions().includes(permissionName);
    }
}

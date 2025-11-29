// seeders/rbac.seeder.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleService } from '../role/role.service';
import { PermissionService } from '../permission/permission.service';
import { UserService } from '../user/user.service';

@Injectable()
export class RbacSeeder implements OnModuleInit {
    constructor(
        private readonly roleService: RoleService,
        private readonly permissionService: PermissionService,
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
        const shouldSeed = this.configService.get<boolean>('SEED_RBAC', false);
        if (shouldSeed) {
            await this.seedRbac();
        }
    }

    private async seedRbac() {
        console.log('🌱 Iniciando seeding de RBAC...');

        try {
            // 1. Crear permisos básicos
            await this.createBasicPermissions();

            // 2. Crear roles básicos
            await this.createBasicRoles();

            // 3. Asignar permisos a roles
            await this.assignPermissionsToRoles();

            // 4. Crear usuario admin si no existe
            await this.createAdminUser();

            console.log('✅ Seeding de RBAC completado exitosamente');
        } catch (error) {
            console.error('❌ Error durante el seeding de RBAC:', error);
        }
    }

    private async createBasicPermissions() {
        console.log('📝 Creando permisos básicos...');

        const resources = ['users', 'roles', 'permissions'];
        const actions = ['create', 'read', 'update', 'delete'];

        for (const resource of resources) {
            for (const action of actions) {
                const permissionName = `${resource}:${action}`;
                const existingPermission =
                    await this.permissionService.findByName(permissionName);

                if (!existingPermission) {
                    await this.permissionService.create({
                        name: permissionName,
                        description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
                        resource,
                        action,
                    });
                    console.log(`  ✓ Creado permiso: ${permissionName}`);
                }
            }
        }

        // Permisos especiales
        const specialPermissions = [
            {
                name: 'system:admin',
                description: 'Acceso completo al sistema',
                resource: 'system',
                action: 'admin',
            },
            {
                name: 'dashboard:view',
                description: 'Ver dashboard administrativo',
                resource: 'dashboard',
                action: 'view',
            },
        ];

        for (const permission of specialPermissions) {
            const existing = await this.permissionService.findByName(
                permission.name
            );
            if (!existing) {
                await this.permissionService.create(permission);
                console.log(`  ✓ Creado permiso especial: ${permission.name}`);
            }
        }
    }

    private async createBasicRoles() {
        console.log('👥 Creando roles básicos...');

        const roles = [
            {
                name: 'super_admin',
                description: 'Administrador con acceso completo al sistema',
            },
            {
                name: 'admin',
                description: 'Administrador con permisos limitados',
            },
            {
                name: 'moderator',
                description: 'Moderador con permisos de lectura y moderación',
            },
            {
                name: 'user',
                description: 'Usuario estándar con permisos básicos',
            },
        ];

        for (const role of roles) {
            const existingRole = await this.roleService.findByName(role.name);
            if (!existingRole) {
                await this.roleService.create(role);
                console.log(`  ✓ Creado rol: ${role.name}`);
            }
        }
    }

    private async assignPermissionsToRoles() {
        console.log('🔗 Asignando permisos a roles...');

        // Super Admin - Todos los permisos
        const superAdminRole = await this.roleService.findByName('super_admin');
        const allPermissions = await this.permissionService.findAll();
        if (superAdminRole && allPermissions.length > 0) {
            await this.roleService.setPermissions(
                superAdminRole.id,
                allPermissions.map((p) => p.id)
            );
            console.log(
                `  ✓ Asignados ${allPermissions.length} permisos a super_admin`
            );
        }

        // Admin - Permisos de gestión básica
        const adminRole = await this.roleService.findByName('admin');
        if (adminRole) {
            const adminPermissions = allPermissions.filter(
                (p) =>
                    p.name.startsWith('users:') ||
                    p.name.startsWith('dashboard:') ||
                    (p.name.startsWith('roles:') && p.action === 'read') ||
                    (p.name.startsWith('permissions:') && p.action === 'read')
            );

            await this.roleService.setPermissions(
                adminRole.id,
                adminPermissions.map((p) => p.id)
            );
            console.log(
                `  ✓ Asignados ${adminPermissions.length} permisos a admin`
            );
        }

        // Moderator - Permisos de lectura y usuarios
        const moderatorRole = await this.roleService.findByName('moderator');
        if (moderatorRole) {
            const moderatorPermissions = allPermissions.filter(
                (p) =>
                    p.action === 'read' ||
                    (p.name?.startsWith('users:') &&
                        ['read', 'update'].includes(p.action ?? ''))
            );

            await this.roleService.setPermissions(
                moderatorRole.id,
                moderatorPermissions.map((p) => p.id)
            );
            console.log(
                `  ✓ Asignados ${moderatorPermissions.length} permisos a moderator`
            );
        }

        // User - Solo permisos básicos
        const userRole = await this.roleService.findByName('user');
        if (userRole) {
            const userPermissions = allPermissions.filter(
                (p) => p.name === 'dashboard:view'
            );

            if (userPermissions.length > 0) {
                await this.roleService.setPermissions(
                    userRole.id,
                    userPermissions.map((p) => p.id)
                );
                console.log(
                    `  ✓ Asignados ${userPermissions.length} permisos a user`
                );
            }
        }
    }

    private async createAdminUser() {
        console.log('👤 Creando usuario administrador...');

        const adminEmail = this.configService.get<string>(
            'ADMIN_EMAIL',
            'admin@example.com'
        );
        const adminPassword = this.configService.get<string>(
            'ADMIN_PASSWORD',
            'Admin123!'
        );

        const existingUser = await this.userService.findByEmail(adminEmail);

        if (!existingUser) {
            // Crear usuario admin
            const passwordHash = await this.hashPassword(adminPassword);
            const adminUser = await this.userService.create(
                adminEmail,
                passwordHash,
                'martin'
            );

            // Asignar rol super_admin
            const superAdminRole =
                await this.roleService.findByName('super_admin');
            if (superAdminRole) {
                await this.userService.setRoles(adminUser.id, [
                    superAdminRole.id,
                ]);
                console.log(`  ✓ Usuario admin creado: ${adminEmail}`);
                console.log(
                    `  ⚠️  IMPORTANTE: Contraseña temporal: ${adminPassword}`
                );
            }
        } else {
            console.log(`  ℹ️  Usuario admin ya existe: ${adminEmail}`);
        }
    }

    private async hashPassword(password: string): Promise<string> {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    }
}

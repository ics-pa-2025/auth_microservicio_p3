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
    ) { }

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
                name: 'admin',
                description: 'Administrador con acceso completo al sistema',
            },
            {
                name: 'client',
                description: 'Cliente con acceso a sus proyectos y reclamos',
            },
            {
                name: 'user',
                description: 'Usuario estándar del sistema',
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

        const allPermissions = await this.permissionService.findAll();

        // 1. Admin - Acceso Total (Reemplaza a super_admin)
        const adminRole = await this.roleService.findByName('admin');
        if (adminRole && allPermissions.length > 0) {
            await this.roleService.setPermissions(
                adminRole.id,
                allPermissions.map((p) => p.id)
            );
            console.log(
                `  ✓ Asignados ${allPermissions.length} permisos a admin`
            );
        }

        // 2. Client - Permisos básicos (Lectura principalmente, o específicos si hubiera)
        // Por ahora le damos permisos similares a 'user' o lectura de dashboard
        const clientRole = await this.roleService.findByName('client');
        if (clientRole) {
            const clientPermissions = allPermissions.filter(
                (p) =>
                    p.name === 'dashboard:view' ||
                    (p.name.startsWith('projects:') && p.action === 'read') // Ejemplo hipotético
            );

            // Si no hay permisos específicos de proyectos aún, al menos ver dashboard
            if (clientPermissions.length === 0) {
                const dashboardPerm = allPermissions.find(p => p.name === 'dashboard:view');
                if (dashboardPerm) clientPermissions.push(dashboardPerm);
            }

            if (clientPermissions.length > 0) {
                await this.roleService.setPermissions(
                    clientRole.id,
                    clientPermissions.map((p) => p.id)
                );
                console.log(
                    `  ✓ Asignados ${clientPermissions.length} permisos a client`
                );
            }
        }

        // 3. User - Permisos básicos
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
                'Administrador'
            );

            // Asignar rol admin
            const adminRole = await this.roleService.findByName('admin');
            if (adminRole) {
                await this.userService.setRoles(adminUser.id, [
                    adminRole.id,
                ]);
                console.log(`  ✓ Usuario admin creado: ${adminEmail}`);
                console.log(
                    `  ⚠️  IMPORTANTE: Contraseña temporal: ${adminPassword}`
                );
            }
        } else {
            console.log(`  ℹ️  Usuario admin ya existe: ${adminEmail}`);
            // Opcional: Asegurarse de que tenga el rol admin si ya existe
            const adminRole = await this.roleService.findByName('admin');
            if (adminRole && !existingUser.hasRole('admin')) {
                await this.userService.assignRoles(existingUser.id, [adminRole.id]);
                console.log(`  ✓ Rol admin asignado a usuario existente: ${adminEmail}`);
            }
        }
    }

    private async hashPassword(password: string): Promise<string> {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    }
}

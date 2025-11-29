import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>
    ) {}

    async create(
        createPermissionDto: CreatePermissionDto
    ): Promise<Permission> {
        const existingPermission = await this.permissionRepository.findOne({
            where: { name: createPermissionDto.name },
        });

        if (existingPermission) {
            throw new BadRequestException('El permiso ya existe');
        }

        const permission =
            this.permissionRepository.create(createPermissionDto);
        return this.permissionRepository.save(permission);
    }

    async findAll(): Promise<Permission[]> {
        return this.permissionRepository.find({
            where: { isActive: true },
        });
    }

    async findOne(id: string): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({
            where: { id, isActive: true },
            relations: ['roles'],
        });

        if (!permission) {
            throw new NotFoundException('Permiso no encontrado');
        }

        return permission;
    }

    async findByName(name: string): Promise<Permission | null> {
        return this.permissionRepository.findOne({
            where: { name, isActive: true },
        });
    }

    async update(
        id: string,
        updatePermissionDto: UpdatePermissionDto
    ): Promise<Permission> {
        const permission = await this.findOne(id);

        if (
            updatePermissionDto.name &&
            updatePermissionDto.name !== permission.name
        ) {
            const existingPermission = await this.permissionRepository.findOne({
                where: { name: updatePermissionDto.name },
            });
            if (existingPermission) {
                throw new BadRequestException(
                    'Ya existe un permiso con ese nombre'
                );
            }
        }

        Object.assign(permission, updatePermissionDto);
        return this.permissionRepository.save(permission);
    }

    async remove(id: string): Promise<void> {
        const permission = await this.findOne(id);
        permission.isActive = false;
        await this.permissionRepository.save(permission);
    }

    // Método helper para crear permisos CRUD para un recurso
    async createCrudPermissions(resource: string): Promise<Permission[]> {
        const actions = ['create', 'read', 'update', 'delete'];
        const permissions: Permission[] = [];

        for (const action of actions) {
            const permissionName = `${resource}:${action}`;
            const existingPermission = await this.findByName(permissionName);

            if (!existingPermission) {
                const permission = await this.create({
                    name: permissionName,
                    description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
                    resource,
                    action,
                });
                permissions.push(permission);
            }
        }

        return permissions;
    }
}

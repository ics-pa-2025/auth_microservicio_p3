import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({
            where: { name: createRoleDto.name },
        });

        if (existingRole) {
            throw new BadRequestException('El rol ya existe');
        }

        const role = this.roleRepository.create(createRoleDto);
        return this.roleRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return this.roleRepository.find({
            relations: ['permissions'],
            where: { isActive: true },
        });
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id, isActive: true },
            relations: ['permissions', 'users'],
        });

        if (!role) {
            throw new NotFoundException('Rol no encontrado');
        }

        return role;
    }

    async findByName(name: string): Promise<Role | null> {
        return this.roleRepository.findOne({
            where: { name, isActive: true },
            relations: ['permissions'],
        });
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);

        if (updateRoleDto.name && updateRoleDto.name !== role.name) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: updateRoleDto.name },
            });
            if (existingRole) {
                throw new BadRequestException(
                    'Ya existe un rol con ese nombre'
                );
            }
        }

        Object.assign(role, updateRoleDto);
        return this.roleRepository.save(role);
    }

    async remove(id: string): Promise<void> {
        const role = await this.findOne(id);
        role.isActive = false;
        await this.roleRepository.save(role);
    }

    async addPermissions(
        roleId: string,
        permissionIds: string[]
    ): Promise<Role> {
        const role = await this.findOne(roleId);
        const permissions =
            await this.permissionRepository.findByIds(permissionIds);

        if (permissions.length !== permissionIds.length) {
            throw new NotFoundException(
                'Algunos permisos no fueron encontrados'
            );
        }

        role.permissions = [...role.permissions, ...permissions];
        return this.roleRepository.save(role);
    }

    async removePermissions(
        roleId: string,
        permissionIds: string[]
    ): Promise<Role> {
        const role = await this.findOne(roleId);
        role.permissions = role.permissions.filter(
            (permission) => !permissionIds.includes(permission.id)
        );
        return this.roleRepository.save(role);
    }

    async setPermissions(
        roleId: string,
        permissionIds: string[]
    ): Promise<Role> {
        const role = await this.findOne(roleId);
        const permissions =
            await this.permissionRepository.findByIds(permissionIds);

        if (permissions.length !== permissionIds.length) {
            throw new NotFoundException(
                'Algunos permisos no fueron encontrados'
            );
        }

        role.permissions = permissions;
        return this.roleRepository.save(role);
    }
}

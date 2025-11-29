import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>
    ) {}

    getAll() {
        const users = this.repo.find();
        return users.then((users) =>
            users.map(
                (user) =>
                    new ResponseUserDto(
                        user.id,
                        user.email,
                        user.fullname,
                        user.phone,
                        user.address,
                        user.isActive,
                        user.roles ? user.roles.map((role) => role.id) : []
                    )
            )
        );
    }

    async deleteById(id: string){
        const user = await this.repo.findOne({ where: { id } });
        const isActive = false
        await this.repo.update({ id: id }, { isActive });
    }

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    async updateUser(
        id: string,
        updateUserDto: UpdateUserDto
    ): Promise<ResponseUserDto> {
        const user = await this.repo.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        Object.assign(user, updateUserDto);

        this.repo.save(user);

        return new ResponseUserDto(
            user.id,
            user.email,
            user.fullname,
            user.phone,
            user.address
        );
    }

    findById(id: string) {
        return this.repo.findOne({ where: { id } });
    }

    async create(email: string, password: string, fullname: string, phone: string = "", address: string = "") {
        const user = this.repo.create({ email, password, fullname, phone, address });
        return this.repo.save(user);
    }

    async setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
        await this.repo.update({ id: userId }, { refreshTokenHash });
    }

    async assignRoles(userId: string, roleIds: string[]): Promise<User> {
        const user = await this.repo.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const roles = await this.roleRepository.findByIds(roleIds);
        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Algunos roles no fueron encontrados');
        }

        user.roles = [...user.roles, ...roles];
        return this.repo.save(user);
    }

    async removeRoles(userId: string, roleIds: string[]): Promise<User> {
        const user = await this.repo.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        user.roles = user.roles.filter((role) => !roleIds.includes(role.id));
        return this.repo.save(user);
    }

    async setRoles(userId: string, roleIds: string[]): Promise<User> {
        const user = await this.repo.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const roles = await this.roleRepository.findByIds(roleIds);
        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Algunos roles no fueron encontrados');
        }

        user.roles = roles;
        return this.repo.save(user);
    }

    async getUserWithRoles(id: string): Promise<User> {
        const user = await this.repo.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }
}

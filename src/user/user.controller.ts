import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RequirePermissions } from 'src/decorators/permissions.decorator';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @RequirePermissions('users:create') // Assuming this permission is checked or will be added
    async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const user = await this.userService.create(
            createUserDto.email,
            passwordHash,
            createUserDto.fullname,
            createUserDto.phone,
            createUserDto.address,
            createUserDto.dni
        );

        if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
            await this.userService.assignRoles(user.id, createUserDto.roleIds);
            // Reload user with roles for response? 
            // assignRoles returns the user but create logic might separate it. 
            // Let's assume we want to return the user with roles? 
            // The assignRoles method in service returns repo.save(user), which should have roles populated?
            // Actually assignRoles does `findOne` with relations, modifies, and saves.
            return this.userService.getUserWithRoles(user.id);
        }

        return user;
    }

    @Get()
    @RequirePermissions('users:read')
    getAll() {
        return this.userService.getAll();
    }

    @Delete(':id')
    deleteById(@Param('id') id: string) {
        this.userService.deleteById(id)
    }

    @Get(':id/roles')
    @RequirePermissions('users:read')
    getUserWithRoles(@Param('id') id: string) {
        return this.userService.getUserWithRoles(id);
    }

    @Patch(':id')
    updateUser(
        @Param('id') id: string,
        @Body(ValidationPipe) updateUserDto: UpdateUserDto
    ) {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Post(':id/roles')
    @RequirePermissions('users:update')
    assignRoles(
        @Param('id') id: string,
        @Body(ValidationPipe) assignRolesDto: AssignRolesDto
    ) {
        return this.userService.assignRoles(id, assignRolesDto.roleIds);
    }

    @Delete(':id/roles')
    @RequirePermissions('users:update')
    removeRoles(
        @Param('id') id: string,
        @Body(ValidationPipe) assignRolesDto: AssignRolesDto
    ) {
        return this.userService.removeRoles(id, assignRolesDto.roleIds);
    }

    @Put(':id/roles')
    @RequirePermissions('users:update')
    setRoles(
        @Param('id') id: string,
        @Body(ValidationPipe) assignRolesDto: AssignRolesDto
    ) {
        return this.userService.setRoles(id, assignRolesDto.roleIds);
    }
}

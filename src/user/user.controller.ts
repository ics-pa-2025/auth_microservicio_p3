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

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @RequirePermissions('users:read')
    getAll() {
        return this.userService.getAll();
    }

    @Delete(':id')
    deleteById(@Param('id') id : string)
    {
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

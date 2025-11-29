import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from '../permission/dto/assign-permission.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('roles:create')
    create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
        return this.roleService.create(createRoleDto);
    }

    @Get()
    // @RequirePermissions('roles:read')
    findAll() {
        return this.roleService.findAll();
    }

    @Get(':id')
    @RequirePermissions('roles:read')
    findOne(@Param('id') id: string) {
        return this.roleService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('roles:update')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateRoleDto: UpdateRoleDto
    ) {
        return this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequirePermissions('roles:delete')
    remove(@Param('id') id: string) {
        return this.roleService.remove(id);
    }

    @Post(':id/permissions')
    @RequirePermissions('roles:update')
    addPermissions(
        @Param('id') id: string,
        @Body(ValidationPipe) assignPermissionsDto: AssignPermissionsDto
    ) {
        return this.roleService.addPermissions(
            id,
            assignPermissionsDto.permissionIds
        );
    }

    @Delete(':id/permissions')
    @RequirePermissions('roles:update')
    removePermissions(
        @Param('id') id: string,
        @Body(ValidationPipe) assignPermissionsDto: AssignPermissionsDto
    ) {
        return this.roleService.removePermissions(
            id,
            assignPermissionsDto.permissionIds
        );
    }

    @Put(':id/permissions')
    @RequirePermissions('roles:update')
    setPermissions(
        @Param('id') id: string,
        @Body(ValidationPipe) assignPermissionsDto: AssignPermissionsDto
    ) {
        return this.roleService.setPermissions(
            id,
            assignPermissionsDto.permissionIds
        );
    }
}

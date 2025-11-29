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
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('permissions:create')
    create(@Body(ValidationPipe) createPermissionDto: CreatePermissionDto) {
        return this.permissionService.create(createPermissionDto);
    }

    @Get()
    @RequirePermissions('permissions:read')
    findAll() {
        return this.permissionService.findAll();
    }

    @Get(':id')
    @RequirePermissions('permissions:read')
    findOne(@Param('id') id: string) {
        return this.permissionService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('permissions:update')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updatePermissionDto: UpdatePermissionDto
    ) {
        return this.permissionService.update(id, updatePermissionDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequirePermissions('permissions:delete')
    remove(@Param('id') id: string) {
        return this.permissionService.remove(id);
    }

    @Post('crud')
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions('permissions:create')
    createCrudPermissions(resource: string) {
        return this.permissionService.createCrudPermissions(resource);
    }
}

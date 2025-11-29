import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionModule } from '../permission/permission.module';

@Module({
    imports: [TypeOrmModule.forFeature([Role, Permission]), PermissionModule],
    controllers: [RoleController],
    providers: [RoleService], // do NOT provide RolesGuard here; it's provided/exported by PermissionModule
    exports: [RoleService],
})
export class RoleModule {}

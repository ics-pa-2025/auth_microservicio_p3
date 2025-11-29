import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { RolesGuard } from '../guards/roles.guard';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Permission]), UserModule],
    controllers: [PermissionController],
    providers: [PermissionService, RolesGuard],
    exports: [PermissionService, RolesGuard, UserModule], // re-export UserModule so UserService is visible to importers
})
export class PermissionModule {}

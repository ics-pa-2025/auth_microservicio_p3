import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserService } from '../user/user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Usuario no autenticado');
        }

        const fullUser = await this.userService.getUserWithRoles(user.userId);

        const hasAllPermissions = requiredPermissions.every((permission) =>
            fullUser.hasPermission(permission)
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException(
                `Permisos insuficientes. Se requiere: ${requiredPermissions.join(', ')}`
            );
        }

        return true;
    }
}

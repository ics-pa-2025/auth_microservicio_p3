import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserService } from '../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private userService: UserService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Obtener roles y permisos requeridos desde los decoradores
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()]
        );

        // Si no se requieren roles ni permisos, permitir acceso
        if (!requiredRoles && !requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        // Obtener usuario completo con roles y permisos
        const fullUser = await this.userService.getUserWithRoles(user.userId);

        // Verificar roles si se especificaron
        if (requiredRoles) {
            const hasRole = requiredRoles.some((role) =>
                fullUser.hasRole(role)
            );
            if (!hasRole) {
                return false;
            }
        }

        // Verificar permisos si se especificaron
        if (requiredPermissions) {
            const hasPermission = requiredPermissions.every((permission) =>
                fullUser.hasPermission(permission)
            );
            if (!hasPermission) {
                return false;
            }
        }

        // Añadir información completa del usuario al request
        request.user = {
            ...request.user,
            roles: fullUser.roles?.map((role) => role.name) || [],
            permissions: fullUser.getAllPermissions(),
        };

        return true;
    }
}

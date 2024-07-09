import {CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {Request} from 'express'
import {Reflector} from "@nestjs/core";
import {COMMON_GUARD} from "../constant";

@Injectable()
export class PermissionGuard implements CanActivate {
    @Inject(Reflector)
    private reflector: Reflector;

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request: Request = context.switchToHttp().getRequest<Request>();

        if (!request.user) {
            return true
        }

        const permissions = request.user.permissions;

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(COMMON_GUARD.REQUIRE_PERMISSION, [
            context.getClass(),
            context.getHandler(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        for (let i = 0; i < requiredPermissions.length; i++) {
            const currentPermission = requiredPermissions[i];
            const found = permissions.find(item => item.code === currentPermission);
            if (!found) {
                throw new UnauthorizedException('您没有访问接口的权限')
            }
        }

        return true;
    }
}

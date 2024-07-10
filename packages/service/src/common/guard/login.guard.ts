import {CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {Observable} from 'rxjs';
import {IUserTokenInfo} from "../types";
import {Request} from "express";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {COMMON_GUARD} from "../constant";
import {UnLoginException} from "../filter/unLogin.filter";

declare module 'express' {
    interface Request {
        user: IUserTokenInfo;
    }
}

@Injectable()
export class LoginGuard implements CanActivate {
    @Inject()
    private reflector: Reflector;

    @Inject(JwtService)
    private jwtService: JwtService;

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        const request: Request = context.switchToHttp().getRequest();

        const requireLogin = this.reflector.getAllAndOverride(COMMON_GUARD.REQUIRE_LOGIN, [
            context.getClass(),
            context.getHandler(),
        ])

        if (!requireLogin) {
            return true
        }

        const authorization = request.headers.authorization;

        if (!authorization) {
            // throw new UnauthorizedException('用户未登录');
            throw new UnLoginException()
        }

        try {
            const token = authorization.split(' ')[1]
            const data = this.jwtService.verify<IUserTokenInfo>(token)

            request.user = {
                uid: data.uid,
                username: data.username,
                roles: data.roles,
                permissions: data.permissions
            }
            return true;
        } catch (err) {
            throw new UnauthorizedException('token 失效，请重新登录')
        }
    }
}

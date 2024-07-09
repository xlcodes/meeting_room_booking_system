import {createParamDecorator, ExecutionContext, SetMetadata} from '@nestjs/common'
import {Request} from "express";
import {COMMON_GUARD} from "../constant";

export const RequireLogin = () => SetMetadata(COMMON_GUARD.REQUIRE_LOGIN, true)

export const RequirePermission = (...permission: string[]) => SetMetadata(COMMON_GUARD.REQUIRE_PERMISSION, permission)

export const UserInfo = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()

    if(!request.user) { return null }

    return data ? request.user[data] : request.user
})
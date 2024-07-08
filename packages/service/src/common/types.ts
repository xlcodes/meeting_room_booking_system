import {Permission} from "../user/entities/permission.entity";

export type TokenType = 'accessToken' | 'refreshToken'

export interface IUserTokenInfo {
    uid: string;
    username?: string;
    roles?: string[];
    permissions?: Permission[];
}
export enum COMMON_PROVIDERS {
    REDIS_CLIENT = 'REDIS_CLIENT'
}

/** 守卫常量 */
export enum COMMON_GUARD {
    /** 登陆守卫 */
    REQUIRE_LOGIN = 'REQUIRE_LOGIN',
    /** 鉴权守卫 */
    REQUIRE_PERMISSION = 'REQUIRE_PERMISSION',
}
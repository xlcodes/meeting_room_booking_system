interface UserInfoVo {
    uid: number;

    username: string;

    nickName: string;

    email: string;

    headPic: string;

    phoneNumber: string;

    isFrozen: boolean;

    isAdmin: boolean;

    createTime: number;

    roles: string[];

    permissions: string[]
}

export class LoginUserVo {
    userInfo: Partial<UserInfoVo>;
    access_token: string;
    refresh_token: string;
}

export class UserDetailVo {
    uid: number;
    username: string;
    nickName: string;
    email: string;
    headPic: string;
    phoneNumber: string;
    isFrozen: boolean;
    createTime: Date;
}
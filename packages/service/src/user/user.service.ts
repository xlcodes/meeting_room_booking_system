import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";
import {LoginUserDto, RegisterUserDto} from "./dto/user.dto";
import {RedisService} from "../redis/redis.service";
import {md5} from "../common/utils";
import {Role} from "./entities/role.entity";
import {Permission} from "./entities/permission.entity";
import {LoginUserVo} from "./vo/user.vo";

@Injectable()
export class UserService {
    private logger = new Logger()

    @InjectRepository(User)
    private userRepository: Repository<User>;

    @InjectRepository(Role)
    private roleRepository: Repository<Role>;

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>;

    @Inject(RedisService)
    private redisService: RedisService;

    async register(user: RegisterUserDto) {
        await this.checkCaptcha(`captcha_${user.email}`, user.captcha)

        const foundUser = await this.userRepository.findOneBy({
            username: user.username
        })

        if (foundUser) {
            throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST)
        }

        const newUser = new User()
        newUser.username = user.username
        newUser.password = md5(user.password)
        newUser.email = user.email
        newUser.nickName = user.nickName

        try {
            await this.userRepository.save(newUser)
            return '注册成功'
        } catch (err) {
            this.logger.error(err, UserService)
            return '注册失败'
        }
    }

    async checkCaptcha(captcha_key: string, captcha: string) {
        const captchaValue = await this.redisService.get(captcha_key)

        if (!captchaValue) {
            throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
        }

        if (captchaValue !== captcha) {
            throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
        }
    }

    async initData() {

        const foundUser = await this.userRepository.findOneBy({
            username: 'zhangsan'
        })

        if (foundUser) {
            throw new HttpException('数据已经被初始化', HttpStatus.BAD_REQUEST)
        }

        const user1 = new User()
        user1.username = 'zhangsan'
        user1.password = md5('111111')
        user1.email = '111111@qq.com'
        user1.isAdmin = true
        user1.nickName = '张三'
        user1.phoneNumber = '13111111111'

        const user2 = new User()
        user2.username = 'lisi'
        user2.password = md5('222222')
        user2.email = '222222@qq.com'
        user2.nickName = '李四'
        user2.phoneNumber = '13122222222'

        const role1 = new Role()
        role1.name = '管理员'

        const role2 = new Role()
        role2.name = '普通用户'

        const p1 = new Permission()
        p1.code = 'aaa'
        p1.desc = 'a接口访问权限'

        const p2 = new Permission()
        p2.code = 'bbb'
        p2.desc = 'b接口访问权限'

        user1.roles = [role1]
        user2.roles = [role2]

        role1.permissions = [p1, p2]
        role2.permissions = [p1]

        try {
            await this.permissionRepository.save([p1, p2])
            await this.roleRepository.save([role1, role2])
            await this.userRepository.save([user1, user2])
            return '数据初始化成功'
        } catch (err) {
            this.logger.error(err, UserService)
            throw new HttpException('数据初始化失败', HttpStatus.BAD_REQUEST)
        }
    }

    async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
        const user = await this.userRepository.findOne({
            where: {
                username: loginUserDto.username,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        })
        // 用户名和密码异常信息暴露不太明显
        if (!user || user.password !== md5(loginUserDto.password)) {
            throw new HttpException('用户不存在或密码错误', HttpStatus.BAD_REQUEST)
        }

        return this.getUserInfoVo(user)
    }

    async findUserById(uid: number, isAdmin: boolean) {
        const user = await this.userRepository.findOne({
            where: {
                uid,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        })

        const vo = new LoginUserVo()

        vo.userInfo = {
            uid: user.uid,
            username: user.username,
            isAdmin: user.isAdmin,
            roles: user.roles.map(item => item.name),
            permissions: user.roles.reduce((arr, item) => {
                item.permissions.forEach(permission => {
                    if (arr.indexOf(permission) === -1) {
                        arr.push(permission);
                    }
                })
                return arr;
            }, [])
        }

        return vo
    }

    async findUserDetailById(uid: number) {
       return await this.userRepository.findOne({
            where: {
                uid
            }
        })
    }

    getUserInfoVo(user: User) {
        const vo = new LoginUserVo()
        vo.userInfo = {
            uid: user.uid,
            username: user.username,
            nickName: user.nickName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            headPic: user.headPic,
            createTime: user.createTime as any,
            isFrozen: user.isFrozen,
            isAdmin: user.isAdmin,
        }

        if (user.roles) {
            vo.userInfo.roles = user.roles.map(item => item.name)
            vo.userInfo.permissions = user.roles.reduce((arr: any, item: Role) => {
                item.permissions.forEach(per => {
                    if (arr.indexOf(per) === -1) {
                        arr.push(per)
                    }
                })
                return arr
            }, [])
        }
        return vo
    }
}

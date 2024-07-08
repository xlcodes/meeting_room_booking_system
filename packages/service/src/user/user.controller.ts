import {Controller, Get, Post, Body, Patch, Param, Delete, Query, Inject} from '@nestjs/common';
import {UserService} from './user.service';
import {LoginUserDto, RegisterUserDto} from "./dto/user.dto";
import {RedisService} from "../redis/redis.service";
import {EmailService} from "../email/email.service";
import {TokenType} from "../common/types";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

@Controller('user')
export class UserController {
    @Inject(EmailService)
    private emailService: EmailService;

    @Inject(RedisService)
    private redisService: RedisService;

    @Inject(JwtService)
    private jwtService: JwtService;

    @Inject(ConfigService)
    private configService: ConfigService;

    constructor(
        private readonly userService: UserService,
    ) {
    }

    /**
     * 数据初始化
     */
    @Get('init-data')
    async initData() {
        return await this.userService.initData()
    }

    /**
     * 注册
     * @param registerUser
     */
    @Post('register')
    async register(@Body() registerUser: RegisterUserDto) {
        return await this.userService.register(registerUser)
    }

    /**
     * 获取注册验证码
     * @param email
     */
    @Get('register-captcha')
    async registerCaptcha(@Query('email') email: string) {
        const code = Math.random().toString().slice(2, 8)
        console.log(code, 'code')
        await this.redisService.set(`captcha_${email}`, code, 5 * 60)
        console.log('save code by redis')
        await this.emailService.sendEmail({
            to: email,
            subject: '注册验证码',
            html: `<p>你的注册验证码是 ${code}，有效期 5 分钟。</p>`
        })

        return '邮件发送成功'
    }

    /**
     * 普通用户登陆
     * @param loginDto
     */
    @Post('login')
    async login(@Body() loginDto: LoginUserDto) {
        const userVo = await this.userService.login(loginDto, false)
        userVo.accessToken = this.signToken(userVo, 'accessToken')
        userVo.refreshToken = this.signToken(userVo, 'refreshToken')
        return userVo;
    }

    /**
     * 管理员登录
     * @param loginDto
     */
    @Post('admin/login')
    async adminLogin(@Body() loginDto: LoginUserDto) {
        const userVo = await this.userService.login(loginDto, true)
        userVo.accessToken = this.signToken(userVo, 'accessToken')
        userVo.refreshToken = this.signToken(userVo, 'refreshToken')
        return userVo;
    }

    /**
     * token签发
     * @param user 用户信息
     * @param type token类型
     */
    signToken(user: any, type: TokenType) {
        const payload = {
            userId: user.uid,
            username: '',
            roles: [],
            permissions: []
        }

        if (type === 'accessToken') {
            payload.username = user.username
            payload.roles = user.roles
            payload.permissions = user.permissions
        }

        if (type === 'accessToken') {
            return this.jwtService.sign(payload, {expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME') || '30m'})
        } else {
            return this.jwtService.sign(payload, {expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_TIME') || '7d'})
        }
    }
}

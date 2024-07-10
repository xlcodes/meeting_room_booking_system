import {Controller, Get, Post, Body, Query, Inject, UnauthorizedException} from '@nestjs/common';
import {UserService} from './user.service';
import {CaptchaQueryDto, LoginUserDto, RegisterUserDto, UpdateUserPasswordDto} from "./dto/user.dto";
import {RedisService} from "../redis/redis.service";
import {EmailService} from "../email/email.service";
import {TokenType} from "../common/types";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {LoginUserVo, UserDetailVo} from "./vo/user.vo";
import {isTrue} from "../common/utils";
import {RequireLogin, UserInfo} from "../common/decorator/require.decorator";

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
     * @param queryDto
     */
    @Get('register-captcha')
    async registerCaptcha(@Query() queryDto: CaptchaQueryDto) {
        const  { email } = queryDto
        const code = Math.random().toString().slice(2, 8)

        await this.redisService.set(`captcha_${email}`, code, 5 * 60)

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
        userVo.access_token = this.signToken(userVo, 'accessToken')
        userVo.refresh_token = this.signToken(userVo, 'refreshToken')
        return userVo;
    }

    /**
     * 管理员登录
     * @param loginDto
     */
    @Post('admin/login')
    async adminLogin(@Body() loginDto: LoginUserDto) {
        const userVo = await this.userService.login(loginDto, true)
        userVo.access_token = this.signToken(userVo, 'accessToken')
        userVo.refresh_token = this.signToken(userVo, 'refreshToken')
        return userVo;
    }

    /**
     * 重新派发 accessToken
     * @param refreshToken
     * @param isAdmin 是否为管理员
     */
    @Get('refresh')
    async refresh(@Query('refreshToken') refreshToken: string, @Query('isAdmin') isAdmin: boolean) {
        try {
            const data = this.jwtService.verify(refreshToken)
            const user = await this.userService.findUserById(data.uid, isTrue(isAdmin))

            return {
                access_token: this.signToken(user, 'accessToken'),
                refresh_token: this.signToken(user, 'refreshToken')
            }
        } catch (err) {
            console.error(err)
            throw new UnauthorizedException('token 已经失效，请重新登陆')
        }
    }

    @Get('info')
    @RequireLogin()
    async info(@UserInfo('uid') uid: number) {
        const user = await this.userService.findUserDetailById(uid)

        const vo = new UserDetailVo();
        vo.uid = user.uid;
        vo.email = user.email;
        vo.username = user.username;
        vo.headPic = user.headPic;
        vo.phoneNumber = user.phoneNumber;
        vo.nickName = user.nickName;
        vo.createTime = user.createTime;
        vo.isFrozen = user.isFrozen;
        return vo;
    }

    /**
     * 用户修改密码
     * @param uid 用户id
     * @param passwordDto
     */
    @Post('update_pwd')
    @RequireLogin()
    async updatePwd(@UserInfo('uid') uid: number, @Body() passwordDto: UpdateUserPasswordDto) {
        console.log(uid)
        return await this.userService.updatePwd(uid, passwordDto)
    }

    /**
     * 获取修改用户信息验证码
     * @param queryDto
     */
    @Get('update-captcha')
    async updateCaptcha(@Query() queryDto: CaptchaQueryDto) {
        const { email } = queryDto

        const code = Math.random().toString().slice(2, 8);

        await this.redisService.set(`update_captcha_${email}`, code, 10 * 60)

        await this.emailService.sendEmail({
            to: email,
            subject: '修改用户信息验证码',
            html: `<p>你的修改密码验证码是 ${code}，有效期 10 分钟。</p>`
        })

        return '邮件发送成功'
    }



    /**
     * token签发
     * @param user 用户信息
     * @param type token类型
     */
    signToken(user: LoginUserVo, type: TokenType) {
        const {userInfo} = user
        const {uid, username, roles, permissions} = userInfo

        const payload = {
            uid,
        }

        if (type === 'accessToken') {
            return this.jwtService.sign({
                ...payload,
                username: username,
                roles: roles,
                permissions: permissions
            }, {expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME') || '30m'})
        } else {
            return this.jwtService.sign(payload, {expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_TIME') || '7d'})
        }
    }
}

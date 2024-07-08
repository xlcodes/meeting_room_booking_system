import {Controller, Get, Post, Body, Patch, Param, Delete, Query, Inject} from '@nestjs/common';
import {UserService} from './user.service';
import {RegisterUserDto} from "./dto/user.dto";
import {RedisService} from "../redis/redis.service";
import {EmailService} from "../email/email.service";

@Controller('user')
export class UserController {
    @Inject(EmailService)
    private emailService: EmailService;

    @Inject(RedisService)
    private redisService: RedisService;

    constructor(
        private readonly userService: UserService,
    ) {
    }

    @Get('init-data')
    async initData() {
        return await this.userService.initData()
    }

    @Post('register')
    async register(@Body() registerUser: RegisterUserDto) {
        return await this.userService.register(registerUser)
    }

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
}

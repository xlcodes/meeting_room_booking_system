import {HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";
import {RegisterUserDto} from "./dto/user.dto";
import {RedisService} from "../redis/redis.service";
import {md5} from "../common/utils";

@Injectable()
export class UserService {
    private logger = new Logger()

    @InjectRepository(User)
    private userRepository: Repository<User>;

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
}

import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Role} from "./entities/role.entity";
import {Permission} from "./entities/permission.entity";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Permission]),
        JwtModule.registerAsync({
            global: true,
            useFactory(configService: ConfigService) {
                return {
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME')
                    }
                }
            },
            inject: [ConfigService]
        })
    ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {
}

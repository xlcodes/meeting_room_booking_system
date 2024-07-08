import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserModule} from './user/user.module';
import {User} from './user/entities/user.entity'
import {Permission} from './user/entities/permission.entity'
import {Role} from './user/entities/role.entity'
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['src/.env']
        }),
        TypeOrmModule.forRootAsync({
            useFactory(configService: ConfigService) {
                return {
                    type: 'mysql',
                    host: configService.get('MYSQL_HOST'),
                    port: configService.get('MYSQL_PORT'),
                    username: configService.get('MYSQL_USER'),
                    password: configService.get('MYSQL_PASSWORD'),
                    database: configService.get('MYSQL_DB'),
                    synchronize: true,
                    logging: true,
                    entities: [User, Role, Permission],
                    poolSize: 10,
                    connectorPackage: 'mysql2',
                    extra: {
                        authPlugins: 'sha256_password'
                    }
                }
            },
            inject: [ConfigService]
        }),
        UserModule,
        RedisModule,
        EmailModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}

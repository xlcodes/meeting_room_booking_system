import {Global, Module} from '@nestjs/common';
import {RedisService} from './redis.service';
import {COMMON_PROVIDERS} from "../common/constant";
import {createClient} from "redis";
import {ConfigService} from "@nestjs/config";

@Global()
@Module({
    providers: [RedisService, {
        provide: COMMON_PROVIDERS.REDIS_CLIENT,
        async useFactory(configService: ConfigService) {
            const client = createClient({
                socket: {
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT')
                },
                database: configService.get('REDIS_DB')
            })
            await client.connect();
            return client;
        },
        inject: [ConfigService]
    }],
    exports: [RedisService]
})
export class RedisModule {
}

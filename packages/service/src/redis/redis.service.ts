import {Inject, Injectable} from '@nestjs/common';
import {COMMON_PROVIDERS} from "../common/constant";
import {RedisClientType} from "redis";

@Injectable()
export class RedisService {
    @Inject(COMMON_PROVIDERS.REDIS_CLIENT)
    private readonly redisClient: RedisClientType;

    async get(key: string): Promise<any> {
        return await this.redisClient.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        await this.redisClient.set(key, value);
        if (ttl) {
            await this.redisClient.expire(key, ttl)
        }

    }
}

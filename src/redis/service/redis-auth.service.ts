import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

/**for auth Redis Service */
@Injectable()
export class RedisAuthService {
    constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) { }
    /**<for login>refresh token 저장*/
    async set(key: string, value: string, ttl?: number) {
        if (ttl) await this.client.set(key, value, 'EX', ttl);
        else await this.client.set(key, value);
    }

    /**<for tokenRefresh>refresh token 조회 */
    async get(key: string) {
        return await this.client.get(key)
    }

    /**<for logout>refresh token 삭제 */
    async del(key: string) {
        return await this.client.del(key)
    }
}
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

/**for Dm Redis Service */
@Injectable()
export class RedisDmService {
    constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) { }
    /**<for dm>채팅창 존재여부 확인 */
    async roomExists(room: string) {
        const len = await this.client.llen(room);
        return len > 0;
    }

    /**<for dm>메세지 redis에 저장 */
    async pushMessageToRedis(room: string, message: string) {
        return await this.client.lpush(room, JSON.stringify(message))
    }

    /**<for dm>방에 TTL 부여 (1일 후 자동 삭제) */
    async expireRoom(room: string, ttlSeconds: number = 60 * 60 * 24) {
        return await this.client.expire(room, ttlSeconds);
    }

    /**<for dm>최근 N개 메시지만 유지 */
    async trimRoomMessages(room: string, limit: number = 50) {
        return await this.client.ltrim(room, 0, limit - 1);
    }

    /**<for dm>메시지 페이징 조회 */
    async getMessages(room: string, start = 0, end = 20) {
        const messages = await this.client.lrange(room, start, end);
        return messages.map((msg) => JSON.parse(msg));
    }

    /**<for dm>BLPOP으로 실시간 수신 (blocking) */
    async waitForNewMessage(room: string) {
        const result = await this.client.blpop(room, 0); // result = [room, message]
        return result ? JSON.parse(result[1]) : null;
    }
}



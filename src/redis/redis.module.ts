import { Module } from '@nestjs/common';
import { RedisDmService } from './service/redis-dm.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisAuthService } from './service/redis-auth.service';

@Module({
  imports: [],
  providers: [
    { //redis client setting
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const client = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379)
        }) 
        //ioredis는 new Redis로 연결시도. 만약 .connect()시 충돌 에러 발생
        return client; 
      },
      inject: [ConfigService]
    },
    RedisDmService,
    RedisAuthService
  ],
  exports: ['REDIS_CLIENT', RedisDmService, RedisAuthService],
})
export class RedisModule { }

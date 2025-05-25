import { Module } from '@nestjs/common';
import { DmGateway } from './dm.gateway';
import { DmService } from './dm.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [DmGateway, DmService,]
})
export class DmModule { }

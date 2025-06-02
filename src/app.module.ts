import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { DmGateway } from './dm/dm.gateway';
import { DmModule } from './dm/dm.module';
import { UserModule } from './users/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { StoryModule } from './story/story.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    RedisModule,
    DmModule,
    UserModule,
    PrismaModule,
    S3Module,
    StoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

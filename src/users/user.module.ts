import { Module } from '@nestjs/common';
import { UserQueryService } from './service/user-query.service';
import { UserController } from './user.controller';
import { UserCommandService } from './service/user-command.service';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [UserController],
  providers: [UserQueryService, UserCommandService],
})
export class UserModule { }

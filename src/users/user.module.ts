import { Module } from '@nestjs/common';
import { UserQueryService } from './service/user-query.service';
import { UserController } from './user.controller';
import { UserCommandService } from './service/user-command.service';

@Module({
  controllers: [UserController],
  providers: [UserQueryService, UserCommandService],
})
export class UserModule { }

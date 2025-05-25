import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UserQueryService } from './service/user-query.service';
import { IsUniqueResponse } from './dto/response/user-commad-response';
import { UserCommandService } from './service/user-command.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userQueryService: UserQueryService,
    private readonly userCommandService: UserCommandService
  ) { }

  @Get('isUniqueNickname')
  async findAll(@Query() nickname: string): Promise<IsUniqueResponse> {
    return await this.userQueryService.isUniqueNickname(nickname);
  }

  @Get('isUniqueEmail')
  async findOne(@Query() email: string): Promise<IsUniqueResponse> {
    return await this.userQueryService.isUniqueEmail(email);
  }
}

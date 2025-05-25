import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IsUniqueResponse } from '../dto/response/user-commad-response';

@Injectable()
export class UserQueryService {
  constructor(private readonly prisma: PrismaService) { }

  async findAllUsers() {
    return await this.prisma.user.findMany();
  }

  async findUserByNickname(nickname: string) {
    return await this.prisma.user.findUnique({
      where: { nickname },
    });
  }

  async findUserById(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**이메일 중복검사 */
  async isUniqueEmail(email: string): Promise<IsUniqueResponse> {
    const isUnique = await this.findUserByEmail(email);
    if (!isUnique) throw new BadRequestException('이미 등록된 이메일입니다.')

    return { isUnique: true, resource: 'email' }
  }

  /**닉네임 중복검사 */
  async isUniqueNickname(nickname: string): Promise<IsUniqueResponse> {
    const isUnique = await this.findUserByNickname(nickname);
    if (!isUnique) throw new BadRequestException('이미 존재하는 닉네임입니다.')

    return { isUnique: true, resource: 'nickname' }
  }

}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { SuccessCommandResponse } from 'src/common/dto/common-response';

import type { User } from '@prisma/client';

@Injectable()
export class UserCommandService {
    constructor(private readonly prisma: PrismaService) { }

    //create-Logic
    async createUser(data: CreateUserDto): Promise<User> {
        return await this.prisma.user.create({
            data,
        });
    }

    /**이미지 변경 */
    async updateUserAvatarUrl(id: number, avatarUrl: string): Promise<SuccessCommandResponse> {
        //추후 image변경 로직 추가
        await this.prisma.user.update({
            where: { id },
            data: { avatarUrl: avatarUrl },
        });
        return { command: 'updateAvatarUrl', success: true };
    }

    /**인사말 변경 */
    async updateUserBio(id: number, bio: string): Promise<SuccessCommandResponse> {
        await this.prisma.user.update({
            where: { id },
            data: { bio: bio },
        });

        return { command: 'updateUserBio', success: true };
    }

    /**(user:authService)비밀번호 변경 */
    async updateUserPassword(id: number, password: string): Promise<SuccessCommandResponse> {
        await this.prisma.user.update({
            where: { id },
            data: { password: password },
        });

        return { command: 'updatePassword', success: true };
    }

    /**닉네임 변경 */
    async updateUserNickname(id: number, nickname: string): Promise<SuccessCommandResponse> { //닉네임
        await this.prisma.user.update({
            where: { id },
            data: { nickname: nickname },
        });

        return { command: 'updateNickname', success: true };
    }
}

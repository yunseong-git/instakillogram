import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
//service
import { UserQueryService } from 'src/users/service/user-query.service';
import { UserCommandService } from 'src/users/service/user-command.service';
import { RedisAuthService } from 'src/redis/service/redis-auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
//dto(req)
import { CreateUserDto } from 'src/users/dto/request/create-user.dto';
import { RegisterDto, LoginDto, updatePasswordDto } from './dto/auth-request.dto';
//dto(res)
import { SuccessCommandResponse } from 'src/common/dto/common-response';
import { AllTokenResponse, JwtPayload, TokenResponse } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly userQueryService: UserQueryService,
        private readonly userCommandService: UserCommandService,
        private readonly redisAuthService: RedisAuthService,
        private readonly jwtService: JwtService
    ) { }

    /**회원가입*/
    async register(dto: RegisterDto): Promise<SuccessCommandResponse> {
        if (!dto.isUniqueEmail || !dto.isUniqueNickname) throw new BadRequestException('이메일과 닉네임 중복검사가 필요합니다.')

        const hashedPassword = await this.hashingPassword(dto.password);
        const userData: CreateUserDto = { email: dto.email, nickname: dto.nickname, password: hashedPassword }

        await this.userCommandService.createUser(userData);

        return { command: 'register', success: true }
    }

    /**로그인 */
    async login(dto: LoginDto): Promise<AllTokenResponse> {
        const user = await this.validateUser(dto)

        const payload: JwtPayload = { userId: user.id, nickname: user.nickname };

        const accessToken = await this.createAccessToken(payload);
        const refreshToken = await this.createRefreshToken(payload);

        await this.setRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken }
    }

    /**유저 패스워드 변경 */
    async updatePassword(userId: number, dto: updatePasswordDto): Promise<SuccessCommandResponse> {
        const { currentPassword, newPassword } = dto;
        if (currentPassword == newPassword) throw new BadRequestException('동일한 비밀번호로 변경할 수 없습니다.');

        const user = await this.userQueryService.findUserById(userId)
        if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');

        await this.validatePassword(currentPassword, user.password);

        const hashedPassword = await this.hashingPassword(newPassword);

        const result = await this.userCommandService.updateUserPassword(user.id, hashedPassword)

        return result;
    }

    /**유저 access토큰 리프레쉬 */
    async tokenRefresh(refreshToken: string): Promise<TokenResponse> {
        //토큰 미지참 요청 에러
        if (!refreshToken) throw new UnauthorizedException('토큰이 존재하지 않습니다.');

        const payload = await this.verifyRefreshToken(refreshToken);
        const newAccessToken = await this.createAccessToken(payload);

        return { accessToken: newAccessToken };
    }

    /**redis서버에 refreshToken 삭제(logout)*/
    async deleteRefreshToken(userId: number): Promise<SuccessCommandResponse> {
        await this.redisAuthService.del(`refresh:${userId}`);
        return { command: 'logout', success: true };
    }

    /**로그인 입력정보 비교*/
    private async validateUser(dto: LoginDto): Promise<User> {
        const { email, password } = dto;

        const user = await this.userQueryService.findUserByEmail(email);
        if (!user) throw new NotFoundException('입력정보를 확인해주세요');

        await this.validatePassword(password, user.password);

        return user;
    }

    /**입력 패스워드 검증*/
    private async validatePassword(password: string, userPassword: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, userPassword);
        if (!isMatch) throw new NotFoundException('입력정보를 확인해주세요');

        return true
    }

    /**비밀번호 해싱*/
    private async hashingPassword(password: string): Promise<string> {
        const salt = this.configService.get<number>('BCRYPT_SALT', { infer: true });
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    /**redis서버에 refreshToken 저장*/
    private async setRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
        await this.redisAuthService.set(
            `refresh: ${userId}`,
            refreshToken,
            60 * 60 * 24 * 7, //ttl = 7d
        )

        return true;
    }

    /**유저와 redis간의 refreshToken검증 */
    private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
        //유저의 refresh 토큰의 서버 발행 여부 검증
        const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
        //redis 서버에서 토큰을 확인하여, 유저 토큰 유효성 검증
        const stored = await this.redisAuthService.get(`refresh:${payload.userId}`);
        if (!stored || stored !== refreshToken) {
            throw new UnauthorizedException('Refresh Token이 일치하지 않습니다.');
        }
        return payload;
    }

    /**access 토큰 발급 */
    private async createAccessToken(payload: JwtPayload): Promise<string> {
        const secret = await this.configService.get('JWT_SECRET');

        return this.createToken(payload, secret, '2h');
    }

    /**refresh 토큰 발급 */
    private async createRefreshToken(payload: JwtPayload): Promise<string> {
        const secret = await this.configService.get('JWT_REFRESH_SECRET');

        return this.createToken(payload, secret, '1d');
    }

    /**토큰 발급 공용 로직 */
    private async createToken(payload: JwtPayload, secret: string, expiresIn: string): Promise<string> {
        const { exp, ...cleanedPayload } = payload;
        return await this.jwtService.signAsync(cleanedPayload, { secret, expiresIn });
    }
}

//dto(req)
import { EmailRegisterDto, EmailLoginDto, updatePasswordDto } from './dto/auth-request.dto';
//dto(res)
import { TokenResponse } from './dto/auth-response.dto';
import { SuccessCommandResponse } from 'src/common/dto/common-response';
//service
import { AuthService } from './auth.service';

import { Controller, Post, Body, Patch, Res, Req, Delete } from '@nestjs/common';
import { Response, Request } from 'express';
import { User } from 'src/common/decorators/user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly AuthService: AuthService,
    ) { }

    @Public()
    @Post('register/email')
    async registerByEmail(@Body() dto: EmailRegisterDto): Promise<SuccessCommandResponse> {
        return await this.AuthService.register(dto);
    }
    /* :todo
        @Public()
        @Post('register/google')
        async registerByGoogle(@Body() dto: EmailRegisterDto): Promise<SuccessCommandResponse> {
            return await this.AuthService.register(dto);
        }
    
        
        @Public()
        @Post('register/kakao')
        async registerByKakao(@Body() dto: EmailRegisterDto): Promise<SuccessCommandResponse> {
            return await this.AuthService.register(dto);
        }
    */

    @Public()
    @Post('login/email')
    async loginByEmail(@Body() dto: EmailLoginDto, @Res({ passthrough: true }) res: Response): Promise<TokenResponse> {
        const { accessToken, refreshToken } = await this.AuthService.login(dto);

        /**refreshToken coockie에 저장 */
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, //JS 접근 방지 -> XSS 방지(로컬 테스트시 false)
            secure: true, //HTTPS에서만 전송
            sameSite: 'strict', //CSRF 방지
            path: '/auth/refresh', //api경로 강제
        });

        return { accessToken: accessToken }
    }

    @Public()
    @Post('refresh')
    async tokenRefresh(@Req() req: Request): Promise<TokenResponse> {
        const refreshToken = req.cookies?.refreshToken;
        const tokenResponse = await this.AuthService.tokenRefresh(refreshToken)

        return tokenResponse;
    }

    @Delete('logout')
    async logout(@User('userId') userId: number): Promise<SuccessCommandResponse> {
        return await this.AuthService.deleteRefreshToken(userId)
    }

    @Patch('password')
    async updatePassword(@User('userId') userId: number, @Body() dto: updatePasswordDto): Promise<SuccessCommandResponse> {
        return await this.AuthService.updatePassword(userId, dto);
    }
}

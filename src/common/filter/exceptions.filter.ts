import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // ← 모든 예외를 잡음
export class ExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        let status = 500;
        let message = '서버 오류가 발생했습니다.';

        // NestJS의 HttpException인 경우
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.message;
        }

        //<for s3>
        else if (exception.name === 'NoSuchKey') {
            status = 404;
            message = '요청한 파일이 존재하지 않습니다.';
        }
        else if (exception.name === 'AccessDenied') {
            status = 403;
            message = 'S3 접근 권한이 없습니다.';
        }
        else if (exception.name === 'CredentialsProviderError') {
            status = 500;
            message = 'AWS 인증 설정 오류';
        }
        else if (exception.code === 'NetworkingError') {
            status = 503;
            message = 'S3 네트워크 오류 발생';
        }

        // 공통 응답 포맷
        res.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: req.url,
        });
    }
}
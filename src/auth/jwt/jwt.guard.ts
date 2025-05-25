import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
    constructor(private reflector: Reflector) {
        super();
    }
    /**
     * authGuard 내부 로직이 RxJS기반 -> 상황에 따라 observable<boolean> 반환 가능성 있음 -> 타입열어둬야함.
     * reflector를 이용하여, 라우트 핸들러에 붙은 메타데이터(IS_PUBLIC_KEY) 가져옴
     * [핸들러(메서드) -> 클래스(컨트롤러)] 순서로 확인
     */
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }
}
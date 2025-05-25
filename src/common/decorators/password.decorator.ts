import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export function IsSecurePassword() {
    return applyDecorators(
        IsNotEmpty({ message: '필수 입력 항목이 누락되었습니다' }),
        Length(10, 18, { message: '비밀번호는 10~18 자리이어야 합니다.' }),
        Matches(/^(?=.*[a-z])(?=.*\d)(?=.*[\W_])$/, {
            message: '비밀번호는 최소 하나의 소문자, 숫자, 특수문자를 포함해야 합니다.',
        })
    );
}
import { IsEmail, IsNotEmpty, Matches, Length } from 'class-validator';
import { IsSecurePassword } from 'src/common/decorators/password.decorator';

export class updatePasswordDto {
  @IsNotEmpty({ message: '필수 입력 항목이 누락되었습니다.' })
  currentPassword!: string;

  @IsSecurePassword()
  newPassword!: string;
}

export class RegisterDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email!: string;

  @IsNotEmpty({ message: '필수 입력 항목이 누락되었습니다.' })
  @Length(2, 20)
  nickname!: string;

  @IsSecurePassword()
  password!: string;

  isUniqueEmail: boolean;
  isUniqueNickname: boolean;
}

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email!: string;

  @IsNotEmpty({ message: '필수 입력 항목이 누락되었습니다' })
  password!: string;
}


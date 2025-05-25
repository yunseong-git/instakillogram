import { IsNotEmpty, MaxLength, IsString, IsUrl, Length } from 'class-validator';

export class UpdateUserBioDto {
    @IsString()
    @MaxLength(50, { message: '자기소개는 50자 이내로 작성해주세요' })
    bio: string;
}

export class UpdateUserImageDto {
    @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
    @IsUrl()
    image: string;
}

export class UpdateUserNicknameDto {
    @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
    @Length(2, 20)
    nickname!: string;
}


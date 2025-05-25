import { IsEmail, IsNotEmpty, Matches, Length } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({})
    email!: string;

    @IsNotEmpty({})
    nickname!: string;

    @IsNotEmpty({})
    password!: string;
}
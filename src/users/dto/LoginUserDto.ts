import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    @IsEmail({}, {message: "Inavalid email format"})
    email: string

    @IsString()
    @MinLength(6, {message: "password must be at least 6 characters"})
    password: string
}
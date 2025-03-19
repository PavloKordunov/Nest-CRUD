import { Status } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, {message: "Invalid Enail format"})
    email: string

    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @MinLength(6, {message: "Password must be at least 6 characters"})
    password: string

    @IsNotEmpty({message: "status is required"})
    status: Status
}
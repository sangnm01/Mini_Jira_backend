import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "generated/prisma/client";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
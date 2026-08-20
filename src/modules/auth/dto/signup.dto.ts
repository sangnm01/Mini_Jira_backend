import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SignUpDto {
    @IsString()
    @IsNotEmpty({message: 'Username is required'})
    username: string;

    @IsEmail({}, {message: 'Invalid email address'})
    @IsNotEmpty({message: 'Email is required'})
    email: string;

    @IsNotEmpty({message: 'Password is required'})
    @MinLength(6, {message: 'Password must be at least 6 characters'})
    @MaxLength(20, {message: 'Password must not exceed 20 characters'})
    password: string;

    @IsNotEmpty({message: 'Confirm password is required'})
    confirmPassword: string;

    @IsString()
    @IsNotEmpty({message: 'Full name is required'})
    fullName: string;
}

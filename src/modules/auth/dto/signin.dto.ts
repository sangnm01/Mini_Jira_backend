import { IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
    @IsString({message: 'Invalid username/email'})
    @IsNotEmpty({message: 'Username/Email is required'})
    usernameOrEmail: string;

    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    password: string;
}

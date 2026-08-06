import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async create(signUpDto: SignUpDto) {
    const { username, email, password, confirmPassword, fullName } = signUpDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.email === email
          ? 'Email is already registered'
          : 'Username is already taken',
      );
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: { username, email, password: hashedPassword, fullName },
    });

    const { password: _password, ...result } = user;
    return result;
  }

  signIn(signInDto: SignInDto) {
    return 'This action signs in a user';
  }
}

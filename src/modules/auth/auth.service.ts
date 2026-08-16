import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';

const SALT_ROUNDS = 10;

// Sắp xếp giảm dần theo attempts để lấy đúng mức khoá cao nhất đã đạt tới.
const LOCKOUT_THRESHOLDS: { attempts: number; lockMinutes: number | null }[] = [
  { attempts: 20, lockMinutes: null }, // null = khoá vĩnh viễn
  { attempts: 15, lockMinutes: 15 },
  { attempts: 10, lockMinutes: 5 },
  { attempts: 5, lockMinutes: 1 },
];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

  async signIn(signInDto: SignInDto) {
    const { usernameOrEmail, password } = signInDto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account has been locked due to too many failed login attempts',
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException({
        message: 'Account is temporarily locked',
        lockedUntil: user.lockedUntil,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;
      // Chỉ khoá đúng lúc số lần sai vừa chạm mốc mới (5, 10, 15, 20),
      // không khoá lại ở các lần sai nằm giữa hai mốc.
      const threshold = LOCKOUT_THRESHOLDS.find(
        (t) => failedLoginAttempts === t.attempts,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts,
          ...(threshold?.lockMinutes === null && { isActive: false }),
          ...(threshold?.lockMinutes != null && {
            lockedUntil: new Date(
              Date.now() + threshold.lockMinutes * 60 * 1000,
            ),
          }),
        },
      });

      throw new UnauthorizedException('Invalid username/email or password');
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    const { password: _password, ...result } = user;
    return { accessToken, user: result };
  }
}

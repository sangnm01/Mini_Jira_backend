import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const listUser = await this.prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    const totalUsers = await this.prisma.user.count();

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: listUser,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages,
      },
    };
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  updateProfile() {
    return 'This action updates the profile of the logged-in user';
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string, userId: string, role: Role) {
    if (role !== Role.ADMIN) {
      throw new NotFoundException('You are not authorized to delete this user');
    }

    if (id === userId) {
      throw new NotFoundException('You cannot delete yourself');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id}
    });

    return {
      message: 'User deleted successfully'
    }
  }
}

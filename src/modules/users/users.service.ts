import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  //Get all users with pagination
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

  //Get user by jwt token - user logged in
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

  //Get user by id
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

   //update user profile by jwt token - user logged in
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId},
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        updatedAt: true,
      }
    })

    return {
      message: 'Profile updated successfully',
      user: updatedUser
    }
  }

  //update user by id
  async update(id: string, updateUserDto: UpdateUserDto, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id}
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (role !== Role.ADMIN) {
      throw new NotFoundException('You are not authorized to update this user');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });

    return {
      message: 'User updated successfully',
      user: updatedUser
    }
  }

  //delete user by id
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

import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  async user(userid: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: userid }, { username: userid }, { deletedAt: null }],
      },
    });
  }

  async users(): Promise<Omit<User, 'password'>[]> {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
    });

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return users.map(({ password: _password, ...user }) => user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    input: Partial<UpdateUserDto>,
  ): Promise<User | null> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...input,
        profileUpdated: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async softDelete(id: string): Promise<User | null> {
    const user = await prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        status: 'Inactive',
        deletedAt: new Date(),
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

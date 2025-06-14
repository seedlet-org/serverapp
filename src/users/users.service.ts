import { Injectable, NotFoundException } from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  async user(userid: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: userid }, { username: userid }],
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async user(userid: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: userid }, { username: userid }],
        deletedAt: null,
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
    input: UpdateUserDto,
    image?: Express.Multer.File,
  ): Promise<User | null> {
    let imageUrl: string | undefined;

    if (image) {
      const supabase = this.supabaseService.getClient();
      const bucket = 'seedlet';
      const filePath = `users/${Date.now()}-${image.originalname}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, image.buffer, {
          contentType: image.mimetype,
          upsert: true,
        });

      if (error) {
        throw new InternalServerErrorException(
          `Upload failed: ${error.message}`,
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      imageUrl = publicUrl;
    }

    if (imageUrl) {
      input.image = imageUrl;
    }

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

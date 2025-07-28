import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { userWithRole } from 'src/common/types';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async user(userid: string): Promise<userWithRole | null> {
    try {
      return prisma.user.findFirst({
        where: {
          OR: [
            { email: userid.toLowerCase() },
            { username: userid.toLowerCase() },
          ],
          deletedAt: null,
        },
        include: {
          role: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }

  async users(): Promise<Omit<User, 'password'>[] | []> {
    try {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
        },
      });

      return users.map(({ password: _password, ...user }) => user);
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException();
    }
  }

  async findById(id: string): Promise<userWithRole | null> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }

  async update(id: string, input: UpdateUserDto, image?: Express.Multer.File) {
    try {
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
          socialLinks: JSON.parse(input.socialLinks as string) as Record<
            string,
            string
          >,
          profileUpdated: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }

  async softDelete(id: string): Promise<User | null> {
    try {
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
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }
}

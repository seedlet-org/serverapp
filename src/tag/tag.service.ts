import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from 'src/prisma/prisma.middleware';

@Injectable()
export class TagService {
  async getAllTags() {
    try {
      const tags = await prisma.tag.findMany();
      return tags;
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Tags not found');
      }

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }

      throw new BadGatewayException('An error was encountered');
    }
  }
}

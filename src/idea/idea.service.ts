import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Idea, IdeaStatus } from '@prisma/client';
import prisma from 'src/prisma/prisma.middleware';
import { CreateIdeaDto } from './dto/idea.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class IdeaService {
  async getAllIdeas(): Promise<Idea[] | []> {
    try {
      const ideas = await prisma.idea.findMany({
        where: {
          refId: null,
          status: {
            in: [IdeaStatus.Published, IdeaStatus.Lab],
          },
        },
        include: {
          tags: true,
        },
      });

      return ideas;
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

  async getIdeaById(id: string): Promise<Idea | null> {
    try {
      const idea = await prisma.idea.findUnique({
        where: {
          id,
        },
        include: {
          owner: true,
          comments: true,
          interests: true,
          tags: true,
        },
      });

      return idea;
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

  async createIdea(input: CreateIdeaDto, ownerId: string) {
    try {
      return prisma.idea.create({
        data: {
          ...input,
          ownerId,
          tags: {
            connectOrCreate: input.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tags: true,
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

  async likeIdea(userId: string, ideaId: string): Promise<{ liked: boolean }> {
    try {
      const idea = await prisma.idea.findUnique({
        where: {
          id: ideaId,
        },
      });
      if (!idea) {
        throw new NotFoundException('Idea not found');
      }

      const existingLike = await prisma.like.findUnique({
        where: {
          userId_ideaId: {
            ideaId,
            userId,
          },
        },
      });

      if (existingLike) {
        await prisma.$transaction([
          prisma.like.delete({
            where: {
              userId_ideaId: {
                userId,
                ideaId,
              },
            },
          }),
          prisma.idea.update({
            where: {
              id: ideaId,
            },
            data: {
              likeCount: {
                decrement: 1,
              },
            },
          }),
        ]);
        return {
          liked: false,
        };
      } else {
        await prisma.$transaction([
          prisma.like.create({
            data: {
              userId,
              ideaId,
            },
          }),
          prisma.idea.update({
            where: {
              id: ideaId,
            },
            data: {
              likeCount: {
                increment: 1,
              },
            },
          }),
        ]);
        return {
          liked: true,
        };
      }
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Idea not found');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }
}

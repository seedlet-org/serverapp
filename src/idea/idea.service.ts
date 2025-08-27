import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Idea, IdeaStatus } from '@prisma/client';
import prisma from 'src/prisma/prisma.middleware';
import {
  CreateIdeaDto,
  IndicateInterestDto,
  UpdateIdeaDto,
} from './dto/idea.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class IdeaService {
  async findAll(): Promise<Idea[] | []> {
    try {
      const ideas = await prisma.idea.findMany({
        where: {
          status: {
            in: [IdeaStatus.Published, IdeaStatus.Lab],
          },
        },
        include: {
          tags: true,
          owner: true,
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

  async findOne(id: string) {
    try {
      const idea = await prisma.idea.findUnique({
        where: {
          id,
        },
        include: {
          owner: true,
          interests: true,
          tags: true,
        },
      });

      const comments = await prisma.comment.findMany({
        where: {
          ideaId: id,
          refType: 'Idea',
        },
        include: {
          owner: true,
        },
      });

      return { idea, comments };
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

  async create(input: CreateIdeaDto, ownerId: string) {
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

  async update(ideaId: string, userId: string, input: Partial<UpdateIdeaDto>) {
    try {
      const idea = await prisma.idea.findUnique({
        where: {
          id: ideaId,
          ownerId: userId,
        },
      });
      if (!idea) {
        throw new NotFoundException();
      }

      return prisma.idea.update({
        where: {
          id: ideaId,
          ownerId: userId,
        },
        data: {
          ...input,
          tags: {
            connectOrCreate: input.tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
        include: {
          tags: true,
        },
      });
    } catch (error) {
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

  async removeTag(ideaId: string, userId: string, tagId: string) {
    try {
      const idea = await prisma.idea.findUnique({
        where: {
          id: ideaId,
          ownerId: userId,
        },
        include: {
          tags: true,
        },
      });
      if (!idea) {
        throw new NotFoundException();
      }

      if (idea.tags.length === 2) {
        throw new BadRequestException('Tags must be at least 2');
      }

      return prisma.idea.update({
        where: {
          id: ideaId,
          ownerId: userId,
        },
        data: {
          tags: {
            disconnect: [{ id: tagId }],
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

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Idea not found');
      }

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
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
          userId_itemId_itemType: {
            itemId: ideaId,
            userId,
            itemType: 'Idea',
          },
        },
      });

      if (existingLike) {
        await prisma.$transaction([
          prisma.like.delete({
            where: {
              userId_itemId_itemType: {
                itemId: ideaId,
                userId,
                itemType: 'Idea',
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
              itemId: ideaId,
              userId,
              itemType: 'Idea',
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

  async showInterest(
    userId: string,
    ideaId: string,
    input?: IndicateInterestDto,
  ): Promise<{ interested: boolean }> {
    try {
      const idea = await prisma.idea.findUnique({
        where: {
          id: ideaId,
        },
      });
      if (!idea) {
        throw new NotFoundException('Idea not found');
      }

      const existingInterest = await prisma.interest.findUnique({
        where: {
          userId_ideaId: {
            ideaId,
            userId,
          },
        },
      });

      if (existingInterest) {
        await prisma.$transaction([
          prisma.interest.delete({
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
              interestCount: {
                decrement: 1,
              },
            },
          }),
        ]);
        return {
          interested: false,
        };
      } else {
        await prisma.$transaction([
          prisma.interest.create({
            data: {
              userId,
              ideaId,
              roleInterestedIn: !input ? null : input.roleInterestedIn,
            },
          }),
          prisma.idea.update({
            where: {
              id: ideaId,
            },
            data: {
              interestCount: {
                increment: 1,
              },
            },
          }),
        ]);
        return {
          interested: true,
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

  async comment(userId: string, ideaId: string, comment: string) {
    try {
      const ideaResponse = await prisma.idea.findUnique({
        where: {
          id: ideaId,
        },
      });
      if (!ideaResponse) {
        throw new NotFoundException();
      }

      const [cmt, idea] = await prisma.$transaction([
        prisma.comment.create({
          data: {
            ownerId: userId,
            ideaId,
            refType: 'Idea',
            content: comment,
          },
          include: {
            owner: true,
          },
        }),
        prisma.idea.update({
          where: {
            id: ideaId,
          },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        idea: { ...idea },
        comment: { ...cmt },
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Idea not found');
      }
      console.log(error);
      throw new BadGatewayException('An error was encountered');
    }
  }
}

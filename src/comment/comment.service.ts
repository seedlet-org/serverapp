import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CommentService {
  async findOne(id: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id,
        },
        include: {
          owner: true,
          replies: {
            include: {
              owner: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Comment not found');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }

  async reply(userId: string, commentId: string, content: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      if (!comment) {
        throw new NotFoundException();
      }

      const [_, reply] = await prisma.$transaction([
        prisma.comment.update({
          where: {
            id: commentId,
          },
          data: {
            commentCount: {
              increment: 1,
            },
          },
        }),
        prisma.comment.create({
          data: {
            ownerId: userId,
            parentId: commentId,
            refType: 'Comment',
            content,
          },
          include: {
            owner: true,
            parent: true,
          },
        }),
      ]);

      return reply;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2023'
      ) {
        throw new BadRequestException('Invalid request parameter');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Comment not found');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }

  async likeComment(
    userId: string,
    commentId: string,
  ): Promise<{ liked: boolean }> {
    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id: commentId,
        },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const existingLike = await prisma.like.findUnique({
        where: {
          userId_itemId_itemType: {
            itemId: commentId,
            userId,
            itemType: 'Comment',
          },
        },
      });

      if (existingLike) {
        await prisma.$transaction([
          prisma.like.delete({
            where: {
              userId_itemId_itemType: {
                itemId: commentId,
                userId,
                itemType: 'Comment',
              },
            },
          }),
          prisma.comment.update({
            where: {
              id: commentId,
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
              itemId: commentId,
              userId,
              itemType: 'Comment',
            },
          }),
          prisma.comment.update({
            where: {
              id: commentId,
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
        throw new NotFoundException('comment not found');
      }
      throw new BadGatewayException('An error was encountered');
    }
  }
}

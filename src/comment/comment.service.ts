import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import prisma from 'src/prisma/prisma.middleware';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class CommentService {
  constructor(private readonly events: EventsService) {}

  async findOne(id: string, CurrentUserId: string) {
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

      const likes = await prisma.like.count({
        where: {
          itemId: id,
          itemType: 'Comment',
          userId: CurrentUserId,
        },
      });

      if (comment) {
        await Promise.all(
          comment.replies.map(async (reply) => {
            const likes = await prisma.like.count({
              where: {
                itemId: reply.id,
                itemType: 'Comment',
                userId: CurrentUserId,
              },
            });
            (reply as Record<string, unknown>).likedByCurrentUser = likes > 0;

            return reply;
          }),
        );
      }

      const likedByCurrentUser = likes > 0;

      return { comment, likedByCurrentUser };
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

      this.events.emit('comment', {
        ref: 'comment',
        refId: commentId,
        reply: reply,
        actorId: userId,
      });

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

      let liked = false;

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
        liked = false;
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
        liked = true;
      }

      this.events.emit('like', {
        ref: 'comment',
        refId: commentId,
        liked,
        actorId: userId,
      });

      return {
        liked,
      };
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

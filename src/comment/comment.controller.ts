import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CommentService } from './comment.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { userWithRole } from 'src/common/types';
import { RoleType, User } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@Throttle({ default: { limit: 3, ttl: 5000 } })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @ApiOperation({
    summary: 'Comment on a comment',
    description: 'Comment on a comment.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comment: {
          type: 'string',
          example: 'This is a comment',
        },
      },
    },
  })
  @Post(':id/comment')
  async comment(
    @Param('id') commentId: string,
    @CurrentUser() user: userWithRole,
    @Body() input: { comment: string },
  ) {
    const response = await this.commentService.comment(
      user.id,
      commentId,
      input.comment,
    );

    return {
      statusCode: 201,
      message: 'Comment added successfully',
      data: response,
    };
  }

  @ApiOperation({
    summary: 'Like a comment',
    description: 'Like and unlike a comment',
  })
  @Post(':id/like')
  @Roles(RoleType.user)
  async LikeComment(@Param('id') commentId: string, @CurrentUser() user: User) {
    const response = (await this.commentService.likeComment(
      user.id,
      commentId,
    )) as {
      liked: boolean;
    };

    return {
      statusCode: 201,
      message: `Comment ${response.liked ? 'liked' : 'unliked'}`,
      data: response,
    };
  }
}

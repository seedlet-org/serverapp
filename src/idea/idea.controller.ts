import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import {
  CreateIdeaDto,
  IndicateInterestDto,
  UpdateIdeaDto,
} from './dto/idea.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RoleType, User } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@Throttle({ default: { limit: 3, ttl: 5000 } })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ideas')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @ApiOperation({
    summary: 'Get all ideas',
    description: 'Fetch all ideas that are published or in a lab.',
  })
  @Get()
  async fetchAll() {
    const ideas = await this.ideaService.getAll();
    if (ideas.length === 0) {
      return {
        statusCode: 200,
        message: 'No idea in record',
        data: [],
      };
    }

    return {
      statusCode: 200,
      message: 'Ideas fetched successfully',
      data: ideas,
    };
  }

  @ApiOperation({
    summary: 'Get idea by id',
    description: 'Fetch an idea by its ID.',
  })
  @Get(':id')
  async fetchOne(@Param('id') id: string) {
    const idea = await this.ideaService.getById(id);

    if (!idea) {
      throw new NotFoundException('Idea not found');
    }

    return {
      statusCode: 200,
      message: 'Idea fetched successfully',
      data: idea,
    };
  }

  @ApiOperation({
    summary: 'Create an idea',
    description: 'Post a new idea',
  })
  @Post()
  @Roles(RoleType.user)
  async create(@Body() input: CreateIdeaDto, @CurrentUser() user: User) {
    const response = await this.ideaService.create(input, user.id);

    return {
      statusCode: 201,
      message: 'Idea created successfully',
      data: response,
    };
  }

  @ApiOperation({
    summary: 'Update an idea',
    description: 'Update an idea',
  })
  @Patch(':id')
  @Roles(RoleType.user)
  async update(
    @Param('id') ideaId: string,
    @Body() input: UpdateIdeaDto,
    @CurrentUser() user: User,
  ) {
    const response = await this.ideaService.update(ideaId, user.id, input);

    return {
      statusCode: 200,
      message: 'Idea updated successfully',
      data: response,
    };
  }

  @ApiOperation({
    summary: 'Remove a tag',
    description: 'Remove a tag from an idea',
  })
  @Delete(':ideaId/tags/:tagId')
  @Roles(RoleType.user)
  async removeTag(
    @Param('ideaId') ideaId: string,
    @Param('tagId') tagId: string,
    @CurrentUser() user: User,
  ) {
    const response = await this.ideaService.removeTag(ideaId, user.id, tagId);

    return {
      statusCode: 200,
      message: 'Tag removed successfully',
      data: response,
    };
  }

  @ApiOperation({
    summary: 'Like an idea',
    description: 'Like and unlike an idea',
  })
  @Post(':id/like')
  @Roles(RoleType.user)
  async LikeIdea(@Param('id') ideaId: string, @CurrentUser() user: User) {
    const response = (await this.ideaService.likeIdea(user.id, ideaId)) as {
      liked: boolean;
    };

    return {
      statusCode: 201,
      message: `Idea ${response.liked ? 'liked' : 'unliked'}`,
      data: response,
    };
  }

  @ApiOperation({
    summary: 'Show interest on an idea',
    description: 'Show/cancel interest on an idea',
  })
  @Post(':id/interest')
  @Roles(RoleType.user)
  async ShowInterest(
    @Param('id') ideaId: string,
    @CurrentUser() user: User,
    @Body() input?: IndicateInterestDto,
  ) {
    const response = (await this.ideaService.showInterest(
      user.id,
      ideaId,
      input,
    )) as {
      interested: boolean;
    };

    return {
      statusCode: 201,
      message: `Interest ${response.interested ? 'shown' : 'removed'}`,
      data: response,
    };
  }

  // @ApiOperation({
  //   summary: 'Comment an idea',
  //   description: 'Add comment to an idea',
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       comment: {
  //         type: 'string',
  //         example: 'This is a comment',
  //       },
  //     },
  //   },
  // })
  // @Post(':id/comment')
  // @Roles(RoleType.user)
  // async comment(
  //   @Param('id') ideaId: string,
  //   @CurrentUser() user: User,
  //   @Body() input: { comment: string },
  // ) {
  //   const response = await this.ideaService.comment(
  //     user.id,
  //     ideaId,
  //     input.comment,
  //   );

  //   return {
  //     statusCode: 201,
  //     message: 'Comment added successfully',
  //     data: response,
  //   };
  // }
}

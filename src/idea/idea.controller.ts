import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateIdeaDto } from './dto/idea.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

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
    const ideas = await this.ideaService.getAllIdeas();
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
    const idea = await this.ideaService.getIdeaById(id);

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
  async createIdea(@Body() input: CreateIdeaDto, @CurrentUser() user: User) {
    const response = await this.ideaService.createIdea(input, user.id);

    return {
      statusCode: 201,
      message: 'Idea created successfully',
      data: response,
    };
  }

  @ApiOperation({
    summary: 'Like an idea',
    description: 'Like and unlike an idea',
  })
  @Post(':id/like')
  async LikeIdea(@Param('id') ideaId: string, @CurrentUser() user: User) {
    const response = (await this.ideaService.likeIdea(user.id, ideaId)) as {
      liked: boolean;
    };

    return {
      statusCode: 201,
      message: `Idea ${response.liked ? 'liked' : 'unliked'} successfully`,
      data: response,
    };
  }
}

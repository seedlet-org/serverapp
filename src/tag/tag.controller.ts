import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiBearerAuth()
@Throttle({ default: { limit: 3, ttl: 5000 } })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @ApiOperation({
    summary: 'Get all tags',
    description: 'Fetch all tags',
  })
  @Get('tags')
  async getAllTags() {
    const tags = await this.tagService.getAllTags();
    if (tags.length === 0) {
      return {
        statusCode: 200,
        message: 'No idea in record',
        data: [],
      };
    }
    return {
      statusCode: 200,
      message: 'Tags fetched successfully',
      data: tags,
    };
  }
}

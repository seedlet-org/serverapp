import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { EventsService } from './events.service';
import { Observable } from 'rxjs';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CommentEventDto,
  CreateIdeaEventDto,
  interestEventDto,
  LikeEventDto,
} from './dto/events.dto';

// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({
    summary: 'Server Side Events',
    description: 'Connect to listen for Server Side Events',
  })
  @ApiProduces('text/event-stream')
  @ApiExtraModels(
    LikeEventDto,
    CommentEventDto,
    interestEventDto,
    CreateIdeaEventDto,
  )
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(LikeEventDto) },
        { $ref: getSchemaPath(CommentEventDto) },
        { $ref: getSchemaPath(interestEventDto) },
        { $ref: getSchemaPath(CreateIdeaEventDto) },
      ],
    },
  })
  @Sse()
  //   @Roles(RoleType.user)
  stream(): Observable<MessageEvent> {
    return this.eventsService.events$;
  }
}

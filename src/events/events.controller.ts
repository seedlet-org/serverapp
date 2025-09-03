import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { EventsService } from './events.service';
import { Observable } from 'rxjs';
import { ApiOperation, ApiProduces } from '@nestjs/swagger';

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
  @Sse()
  //   @Roles(RoleType.user)
  stream(): Observable<MessageEvent> {
    return this.eventsService.events$;
  }
}

import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { EventsService } from 'src/events/events.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, EventsService],
})
export class CommentModule {}

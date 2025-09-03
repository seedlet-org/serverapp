import { Module } from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaController } from './idea.controller';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [EventsModule],
  providers: [IdeaService],
  controllers: [IdeaController],
})
export class IdeaModule {}

import { Controller, Get } from '@nestjs/common';
import { IdeaService } from './idea.service';

@Controller('idea')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  //   @Get()
  //   async fetchAll() {
  //     return await this.ideaService.getAllIdeas();
  //   }

  //   @Get(':id')
  //   async fetchOne(id: string) {
  //     return await this.ideaService.getIdeaById(id);
  //   }
}

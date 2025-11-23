import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {
  @Get()
  index() {
    return 'Welcome to Seedlet API';
  }
}

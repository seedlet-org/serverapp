import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { emailDTO } from './dto/email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  sendMail(@Body() input: emailDTO) {
    return this.emailService.sendMail(input);
  }
}

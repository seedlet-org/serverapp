import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { emailDTO } from './dto/email.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({
    summary: 'Send an email',
    description:
      'Sends an email to the specified recipient with the provided subject and message.',
  })
  @Post('send')
  sendMail(@Body() input: emailDTO) {
    return this.emailService.sendMail(input);
  }
}

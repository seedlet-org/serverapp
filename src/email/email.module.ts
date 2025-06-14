import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}

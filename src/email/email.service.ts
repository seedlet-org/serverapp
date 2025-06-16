import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { emailDTO } from './dto/email.dto';

@Injectable()
export class EmailService {
  private SMTP_HOST: string;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.SMTP_HOST = this.configService.get<string>('SMTP_HOST')!;
  }

  async sendMail(input: emailDTO) {
    const response: AxiosResponse<any, any> =
      await this.httpService.axiosRef.post(this.SMTP_HOST, {
        to: input.to,
        subject: input.subject,
        message: input.message,
      });

    if (response.status !== 200) {
      throw new BadRequestException('Failed to send mail');
    }
  }
}

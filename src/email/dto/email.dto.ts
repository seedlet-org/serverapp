import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class emailDTO {
  @ApiProperty()
  @IsString()
  message: string;
  @ApiProperty()
  @IsString()
  subject: string;
  @IsEmail()
  to: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class UserDTO {
  @ApiProperty()
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  firstname: string;
  @IsString()
  lastname: string;
  @IsString()
  title: string;
  @IsString()
  imageUrl: string;
  @IsString()
  country: string;
  @IsString()
  state: string;
  @IsString()
  bio: string;
  @IsString()
  socialLinks: string;
  @IsBoolean()
  profileUpdated: string;
  @IsString()
  status: string;
}

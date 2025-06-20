import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, IsUrl } from 'class-validator';

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
  @IsUrl()
  imageUrl: string;
  @IsString()
  role: 'User' | 'Admin';
  @IsString()
  country: string;
  @IsString()
  state: string;
  @IsString()
  bio: string;
  @IsString()
  socialLinks: Record<string, string>;
  @IsBoolean()
  profileUpdated: boolean;
  @IsString()
  status: 'Active' | 'Inactive';
}

export class UpdateUserDto extends OmitType(UserDTO, [
  'id',
  'email',
  'username',
  'password',
  'status',
  'role',
] as const) {}

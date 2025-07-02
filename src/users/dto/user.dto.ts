import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstname?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastname?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsUrl()
  image?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  socialLinks?: Record<string, string>;
}

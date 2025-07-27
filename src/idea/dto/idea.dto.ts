import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateIdeaDto {
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  title: string;
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(20)
  @MaxLength(255)
  description: string;
  @ApiProperty({ required: true })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  tags: string[];
  @ApiProperty({ required: false })
  @IsOptional()
  needed_roles?: string[];
}

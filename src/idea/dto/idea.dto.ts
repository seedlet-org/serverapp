import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
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
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  neededRoles?: string[];
}

export class UpdateIdeaDto {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsOptional()
  title: string;
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(20)
  @MaxLength(255)
  @IsOptional()
  description: string;
  @ApiProperty({ required: false })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsOptional()
  tags: string[];
  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  neededRoles?: string[];
}

export class IndicateInterestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roleInterestedIn?: string;
}

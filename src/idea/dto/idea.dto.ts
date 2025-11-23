import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIdeaDto {
  @ApiProperty({
    required: true,
    example: 'idea title',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  title: string;
  @ApiProperty({
    required: true,
    example: 'idea description with more details.',
    minLength: 20,
    maxLength: 300,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(300)
  description: string;
  @ApiProperty({
    required: true,
    example: ['tag1', 'tag2'],
    minItems: 2,
    maxItems: 4,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  tags: string[];
  @ApiPropertyOptional({
    example: ['product designer', 'backend developer'],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  neededRoles?: string[];
}

export class UpdateIdeaDto extends PartialType(CreateIdeaDto) {
  @ApiPropertyOptional({
    example: 'Updated idea title',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @IsOptional()
  title: string;
  @ApiPropertyOptional({
    example: 'Updated idea description with more details.',
    minLength: 20,
    maxLength: 300,
  })
  @IsString()
  @MinLength(20)
  @MaxLength(300)
  @IsOptional()
  description: string;
  @ApiPropertyOptional({
    example: ['tag1', 'tag2'],
    minItems: 2,
    maxItems: 4,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsOptional()
  tags: string[];
  @ApiPropertyOptional({
    example: ['product designer', 'backend developer'],
  })
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

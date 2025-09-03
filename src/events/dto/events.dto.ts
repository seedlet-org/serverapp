import { ApiProperty } from '@nestjs/swagger';

export class LikeEventDto {
  @ApiProperty({ example: 'idea' })
  ref: string;

  @ApiProperty({ example: '12345-35345-67878' })
  refId: string;

  @ApiProperty({ example: true })
  liked: boolean;
}

export class CommentEventDto {
  @ApiProperty({ example: 'idea' })
  ref: string;

  @ApiProperty({ example: '12345' })
  refId: string;

  @ApiProperty({
    example: {
      content: 'string',
      id: 'string',
      likeCount: 'number',
      commentCount: 0,
      ownerId: 'string',
      ideaId: 'string',
      parentId: 'string',
    },
  })
  reply: object;
}

export class interestEventDto {
  @ApiProperty({ example: 'idea' })
  ref: string;

  @ApiProperty({ example: '12345' })
  refId: string;

  @ApiProperty({ example: true })
  interested: boolean;
}

export class CreateIdeaEventDto {
  @ApiProperty({ example: 'idea' })
  ref: string;

  @ApiProperty({ example: '12345' })
  refId: string;

  @ApiProperty({
    example: {
      id: 'string',
      likeCount: 'number',
      commentCount: 0,
      ownerId: 'string',
    },
  })
  idea: object;
}

import { ApiProperty } from '@nestjs/swagger';

export class LikeEventDto {
  @ApiProperty({ example: 'idea' })
  ref: string;

  @ApiProperty({ example: '12345-35345-67878' })
  refId: string;

  @ApiProperty({ example: true })
  liked: boolean;

  @ApiProperty({ example: '12345-35345-67878' })
  actorId: string;
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

  @ApiProperty({ example: '12345-35345-67878' })
  actorId: string;
}

export class interestEventDto {
  @ApiProperty({ example: 'idea' })
  ref: string;

  @ApiProperty({ example: '12345' })
  refId: string;

  @ApiProperty({ example: true })
  interested: boolean;

  @ApiProperty({ example: '12345-35345-67878' })
  actorId: string;
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

  @ApiProperty({ example: '12345-35345-67878' })
  actorId: string;
}

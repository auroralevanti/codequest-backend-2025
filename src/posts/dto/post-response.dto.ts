import { ApiProperty } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;
}

export class PostResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: PostAuthorDto })
  author: PostAuthorDto;

  @ApiProperty({ required: false })
  likesCount?: number;

  @ApiProperty({ required: false })
  commentsCount?: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}

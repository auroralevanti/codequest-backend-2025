import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ required: false, description: 'Indicates if the current user has liked this post' })
  isLikedByUser?: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Array of image URLs attached to the post',
    example: ['https://res.cloudinary.com/demo/image/upload/v123456/img1.jpg']
  })
  images?: string[];
}

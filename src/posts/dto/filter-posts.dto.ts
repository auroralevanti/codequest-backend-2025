import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PostStatus } from './create-post.dto';

export class FilterPostsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search term for title and content',
    example: 'javascript'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by post status',
    enum: PostStatus,
    example: PostStatus.PUBLISHED
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    description: 'Filter by author ID',
    example: 'uuid-author-id'
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'uuid-category-id'
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag ID',
    example: 'uuid-tag-id'
  })
  @IsOptional()
  @IsUUID()
  tagId?: string;

  @ApiPropertyOptional({
    description: 'Filter posts published after this date',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  publishedAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter posts published before this date',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  publishedBefore?: string;
}
import { IsOptional, IsString, IsEnum, IsUUID, IsDateString, ValidateIf } from 'class-validator';
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
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @ValidateIf((o) => o.authorId && o.authorId.trim() !== '')
  @IsUUID(4, { message: 'Author ID must be a valid UUID' })
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsOptional()
  @ValidateIf((o) => o.categoryId && o.categoryId.trim() !== '')
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tag ID',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  @IsOptional()
  @ValidateIf((o) => o.tagId && o.tagId.trim() !== '')
  @IsUUID(4, { message: 'Tag ID must be a valid UUID' })
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
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'Mi primer post en DevTalles',
    minLength: 3,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Content of the post in markdown format',
    example: '# Mi Post\n\nEste es el contenido de mi post...'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'URL slug for the post (auto-generated if not provided)',
    example: 'mi-primer-post-en-devtalles'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Status of the post',
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
    default: PostStatus.PUBLISHED
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    description: 'Array of category IDs to associate with the post',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of tag IDs to associate with the post',
    example: ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174003']
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  tagIds?: string[];
}
import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  postId: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({ description: 'Comment body text', example: 'Nice post!' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'If replying to another comment, the parent comment id' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

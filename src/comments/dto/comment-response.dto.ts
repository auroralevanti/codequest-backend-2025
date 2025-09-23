import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  postId: string;

  @ApiProperty({ description: 'Comment author information' })
  author: { id: string; username: string; avatarUrl?: string } | null;

  @ApiProperty()
  body: string;

  @ApiProperty({ format: 'uuid', required: false })
  parentCommentId?: string;

  @ApiProperty({ required: false, description: 'Number of likes on this comment' })
  likesCount?: number;

  @ApiProperty({ required: false, description: 'Whether the current user has liked this comment' })
  isLikedByUser?: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;

  static fromEntity(entity: any): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = entity.id;
    dto.postId = entity.postId;
    dto.author = entity.author ? { id: entity.author.id, username: entity.author.username, avatarUrl: entity.author.avatarUrl } : null;
    dto.body = entity.body;
    dto.parentCommentId = entity.parentCommentId;
    dto.likesCount = entity.likesCount;
    dto.isLikedByUser = entity.isLikedByUser;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

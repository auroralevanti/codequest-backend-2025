import { User } from '../../users/entities/user.entity';

export class CommentResponseDto {
  id: string;
  postId: string;
  author: { id: string; username: string; avatarUrl?: string } | null;
  body: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: any): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = entity.id;
    dto.postId = entity.postId;
    dto.author = entity.author ? { id: entity.author.id, username: entity.author.username, avatarUrl: entity.author.avatarUrl } : null;
    dto.body = entity.body;
    dto.parentCommentId = entity.parentCommentId;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

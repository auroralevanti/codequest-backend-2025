import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { RolesService } from '../roles/services/roles.service';
import { LikesService } from '../likes/likes.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly rolesService: RolesService,
    private readonly likesService: LikesService,
  ) {}

  async create(createDto: CreateCommentDto, user?: User): Promise<CommentResponseDto> {
    const comment = this.commentRepository.create({
      ...createDto,
      authorId: createDto.authorId || user?.id,
    });

    const saved = await this.commentRepository.save(comment);
    const loaded = await this.commentRepository.findOne({ where: { id: saved.id }, relations: ['author'] });
    const [commentWithCounts] = await this.addCommentCounts([loaded], user);
    return CommentResponseDto.fromEntity(commentWithCounts);
  }

  async findAllByPost(postId: string, pagination?: PaginationDto, currentUser?: User): Promise<{ data: CommentResponseDto[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination || {};
    const [comments, total] = await this.commentRepository.findAndCount({ 
      where: { postId, parentCommentId: IsNull() },
      relations: ['author'], 
      skip: offset, 
      take: limit, 
      order: { createdAt: 'DESC' } 
    });
    
    const commentsWithCounts = await this.addCommentCounts(comments, currentUser);
    return { data: commentsWithCounts.map(c => CommentResponseDto.fromEntity(c)), total };
  }

  async findOne(id: string, currentUser?: User): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author'] });
    if (!comment) throw new NotFoundException('Comment not found');
    const [commentWithCounts] = await this.addCommentCounts([comment], currentUser);
    return CommentResponseDto.fromEntity(commentWithCounts);
  }

  async update(id: string, updateDto: UpdateCommentDto, user: User): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    const isAdmin = await this.rolesService.userHasRole(user.id, 'admin');
    if (comment.authorId !== user.id && !isAdmin) throw new ForbiddenException('Not allowed');

    Object.assign(comment, updateDto);
    const saved = await this.commentRepository.save(comment);
    const loaded = await this.commentRepository.findOne({ where: { id: saved.id }, relations: ['author'] });
    const [commentWithCounts] = await this.addCommentCounts([loaded], user);
    return CommentResponseDto.fromEntity(commentWithCounts);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    const isAdmin = await this.rolesService.userHasRole(user.id, 'admin');
    if (comment.authorId !== user.id && !isAdmin) throw new ForbiddenException('Not allowed');

    await this.commentRepository.remove(comment);
  }

  async getCommentsCountByPost(postId: string): Promise<number> {
    return this.commentRepository.count({ where: { postId } });
  }

  private async addCommentCounts(comments: Comment[], currentUser?: User): Promise<Comment[]> {
    const commentsWithCounts = await Promise.all(
      comments.map(async (comment) => {
        const likesCount = await this.likesService.getCommentLikesCount(comment.id);
        const isLikedByUser = currentUser 
          ? await this.likesService.isCommentLikedByUser(comment.id, currentUser.id)
          : false;

        return {
          ...comment,
          likesCount,
          isLikedByUser,
        };
      })
    );

    return commentsWithCounts;
  }

  async findReplies(parentCommentId: string, pagination?: PaginationDto, currentUser?: User): Promise<{ data: CommentResponseDto[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination || {};
    const [comments, total] = await this.commentRepository.findAndCount({ 
      where: { parentCommentId }, 
      relations: ['author'], 
      skip: offset, 
      take: limit, 
      order: { createdAt: 'ASC' }
    });
    
    const commentsWithCounts = await this.addCommentCounts(comments, currentUser);
    return { data: commentsWithCounts.map(c => CommentResponseDto.fromEntity(c)), total };
  }
}

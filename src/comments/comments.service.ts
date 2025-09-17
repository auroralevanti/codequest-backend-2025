import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { RolesService } from '../roles/services/roles.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createDto: CreateCommentDto, user?: User): Promise<CommentResponseDto> {
    const comment = this.commentRepository.create({
      ...createDto,
      authorId: createDto.authorId || user?.id,
    });

    const saved = await this.commentRepository.save(comment);
    const loaded = await this.commentRepository.findOne({ where: { id: saved.id }, relations: ['author'] });
    return CommentResponseDto.fromEntity(loaded);
  }

  async findAllByPost(postId: string, pagination?: PaginationDto): Promise<{ data: CommentResponseDto[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination || {};
    const [comments, total] = await this.commentRepository.findAndCount({ where: { postId }, relations: ['author'], skip: offset, take: limit, order: { createdAt: 'DESC' } });
    return { data: comments.map(c => CommentResponseDto.fromEntity(c)), total };
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author'] });
    if (!comment) throw new NotFoundException('Comment not found');
    return CommentResponseDto.fromEntity(comment);
  }

  async update(id: string, updateDto: UpdateCommentDto, user: User): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    const isAdmin = await this.rolesService.userHasRole(user.id, 'admin');
    if (comment.authorId !== user.id && !isAdmin) throw new ForbiddenException('Not allowed');

    Object.assign(comment, updateDto);
    const saved = await this.commentRepository.save(comment);
    const loaded = await this.commentRepository.findOne({ where: { id: saved.id }, relations: ['author'] });
    return CommentResponseDto.fromEntity(loaded);
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
}

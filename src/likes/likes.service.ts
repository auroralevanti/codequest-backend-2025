import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepo: Repository<CommentLike>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async likePost(postId: string, userId: string): Promise<PostLike> {
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.likeRepo.findOneBy({ postId, userId });
    if (existing) return existing;

    const like = this.likeRepo.create({ postId, userId });
    return this.likeRepo.save(like);
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const res = await this.likeRepo.delete({ postId, userId });
    return;
  }

  async listPostLikes(postId: string): Promise<PostLike[]> {
    return this.likeRepo.find({ where: { postId } });
  }

  // Comment likes
  async likeComment(commentId: string, userId: string): Promise<CommentLike> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    const existing = await this.commentLikeRepo.findOneBy({ commentId, userId });
    if (existing) return existing;

    const like = this.commentLikeRepo.create({ commentId, userId });
    return this.commentLikeRepo.save(like);
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    await this.commentLikeRepo.delete({ commentId, userId });
  }

  async listCommentLikes(commentId: string): Promise<CommentLike[]> {
    return this.commentLikeRepo.find({ where: { commentId } });
  }

  async getPostLikesCount(postId: string): Promise<number> {
    return this.likeRepo.count({ where: { postId } });
  }

  async getCommentLikesCount(commentId: string): Promise<number> {
    return this.commentLikeRepo.count({ where: { commentId } });
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const like = await this.likeRepo.findOne({ where: { postId, userId } });
    return !!like;
  }

  async isCommentLikedByUser(commentId: string, userId: string): Promise<boolean> {
    const like = await this.commentLikeRepo.findOne({ where: { commentId, userId } });
    return !!like;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
}

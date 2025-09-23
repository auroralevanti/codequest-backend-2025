import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { CommentLikesController } from './comment-likes.controller';
import { PostLike } from './entities/post-like.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostLike, CommentLike, Post, User, Comment])],
  providers: [LikesService],
  controllers: [LikesController, CommentLikesController],
  exports: [LikesService],
})
export class LikesModule {}

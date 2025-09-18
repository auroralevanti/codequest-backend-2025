import { Controller, Post, Delete, Get, Param, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ApiTags, ApiOperation, ApiParam, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { LikeResponseDto } from './dto/like-response.dto';

@ApiTags('Likes')
@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'postId', description: 'Post id to like', type: 'string', format: 'uuid' })
  @ApiCreatedResponse({ type: LikeResponseDto })
  async like(@Param('postId') postId: string, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user?.id;
    const created = await this.likesService.likePost(postId, userId);
    if (created && created.id) res.setHeader('Location', `/posts/${postId}/likes/${created.id}`);
    res.status(HttpStatus.CREATED);
    return created;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'postId', description: 'Post id to unlike', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Like removed' })
  async unlike(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user?.id;
    await this.likesService.unlikePost(postId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List likes for a post' })
  @ApiParam({ name: 'postId', description: 'Post id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ type: [LikeResponseDto] })
  async list(@Param('postId') postId: string, @Res({ passthrough: true }) res: Response) {
    const likes = await this.likesService.listPostLikes(postId);
    res.setHeader('X-Total-Count', likes.length.toString());
    return likes;
  }
}

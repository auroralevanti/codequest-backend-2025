import { Controller, Post, Delete, Get, Param, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { LikesService } from './likes.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { Response } from 'express';

@ApiTags('Likes')
@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Like a post' })
  async like(@Param('postId') postId: string, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user?.id;
    const created = await this.likesService.likePost(postId, userId);
    if (created && created.id) res.setHeader('Location', `/posts/${postId}/likes/${created.id}`);
    res.status(HttpStatus.CREATED);
    return created;
  }

  @Delete()
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a post' })
  async unlike(@Param('postId') postId: string, @Req() req: any) {
    const userId = req.user?.id;
    await this.likesService.unlikePost(postId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List likes for a post' })
  async list(@Param('postId') postId: string, @Res({ passthrough: true }) res: Response) {
    const likes = await this.likesService.listPostLikes(postId);
    res.setHeader('X-Total-Count', likes.length.toString());
    return likes;
  }
}

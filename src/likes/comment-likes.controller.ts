import { Controller, Post, Delete, Get, Param, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Comment Likes')
@Controller('comments/:commentId/likes')
export class CommentLikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Like a comment' })
  async like(@Param('commentId') commentId: string, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user?.id;
    const created = await this.likesService.likeComment(commentId, userId);
    if (created && created.id) res.setHeader('Location', `/comments/${commentId}/likes/${created.id}`);
    res.status(HttpStatus.CREATED);
    return created;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlike a comment' })
  async unlike(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user?.id;
    await this.likesService.unlikeComment(commentId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List likes for a comment' })
  async list(@Param('commentId') commentId: string, @Res({ passthrough: true }) res: Response) {
    const likes = await this.likesService.listCommentLikes(commentId);
    res.setHeader('X-Total-Count', likes.length.toString());
    return likes;
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Response } from 'express';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCommentDto, @CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    const created = await this.commentsService.create(createDto, user);
    if (created && created.id) res.setHeader('Location', `/comments/${created.id}`);
    return created;
  }

  // Note: listing by post is exposed as nested route under PostsController

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by id' })
  @ApiParam({ name: 'id', description: 'Comment id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ type: CommentResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.commentsService.findOne(id, user);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies to a comment' })
  @ApiParam({ name: 'id', description: 'Parent comment id', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0, description: 'Number of items to skip' })
  @ApiOkResponse({ type: [CommentResponseDto] })
  findReplies(
    @Param('id', ParseUUIDPipe) parentCommentId: string, 
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User
  ) {
    return this.commentsService.findReplies(parentCommentId, pagination, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiOkResponse({ type: CommentResponseDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateCommentDto, @CurrentUser() user: User) {
    return this.commentsService.update(id, updateDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment id', type: 'string', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Comment deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user);
  }
}

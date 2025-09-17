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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Auth } from '../auth/decorators/auth.decorator';
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
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCommentDto, @CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    const created = await this.commentsService.create(createDto, user);
    if (created && created.id) res.setHeader('Location', `/comments/${created.id}`);
    return created;
  }

  // Note: listing by post is exposed as nested route under PostsController

  @Get(':id')
  @ApiOperation({ summary: 'Get a comment by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies to a comment' })
  findReplies(
    @Param('id', ParseUUIDPipe) parentCommentId: string, 
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.findReplies(parentCommentId, pagination);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @Auth()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateCommentDto, @CurrentUser() user: User) {
    return this.commentsService.update(id, updateDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.commentsService.remove(id, user);
  }
}

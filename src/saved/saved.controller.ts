import { Controller, Post, Body, UseGuards, Get, Param, Delete } from '@nestjs/common';
import { SavedService } from './saved.service';
import { CreateSavedListDto } from './dto/create-saved-list.dto';
import { AddPostToListDto } from './dto/add-post-to-list.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Saved')
@Controller('saved')
export class SavedController {
  constructor(private readonly savedService: SavedService) {}

  @Post('lists')
  @Auth()
  createList(@Body() dto: CreateSavedListDto, @CurrentUser() user: User) {
    return this.savedService.createList(user.id, dto);
  }

  @Get('lists')
  @Auth()
  getLists(@CurrentUser() user: User) {
    return this.savedService.getLists(user.id);
  }

  @Delete('lists/:id')
  @Auth()
  deleteList(@Param('id') id: string, @CurrentUser() user: User) {
    return this.savedService.deleteList(id, user.id);
  }

  @Post('posts')
  @Auth()
  addPost(@Body() dto: AddPostToListDto, @CurrentUser() user: User) {
    return this.savedService.addPostToList(user.id, dto.postId, dto.listId);
  }

  @Delete('posts')
  @Auth()
  removePost(@Body() dto: AddPostToListDto, @CurrentUser() user: User) {
    return this.savedService.removePostFromList(user.id, dto.postId, dto.listId);
  }

  @Get('lists/:id/posts')
  @Auth()
  getPostsInList(@Param('id') id: string, @CurrentUser() user: User) {
    return this.savedService.getPostsInList(id, user.id);
  }

  @Get('posts')
  @Auth()
  getUserSavedPosts(@CurrentUser() user: User) {
    return this.savedService.getUserSavedPosts(user.id);
  }
}

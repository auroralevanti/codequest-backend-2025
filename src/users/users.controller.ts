import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';

import { User } from './entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { PostsService } from 'src/posts/posts.service';
import { FilterPostsDto } from 'src/posts/dto/filter-posts.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  @Auth('admin')
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<User[]> {
    return this.usersService.findAll( paginationDto );
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: User): User {
    return user;
  }

  @Get('me/posts')
  getCurrentUserPosts(
    @Query() filterDto: FilterPostsDto,
    @CurrentUser() user: User
  ) {
    const myPostsFilter = { ...filterDto, authorId: user.id };
    return this.postsService.findAll(myPostsFilter, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get(':id/posts')
  getPostsByUserId(
    @Param('id') id: string,
    @Query() filterDto: FilterPostsDto,
    @CurrentUser() user?: User
  ) {
    const userPostsFilter = { ...filterDto, authorId: id };
    return this.postsService.findAll(userPostsFilter, user);
  }

  @Delete(':id')
  @Auth('admin') // just admin users
  blockUser(@Param('id') id: string): Promise<User> {
    return this.usersService.blockUser(id);
  }

}

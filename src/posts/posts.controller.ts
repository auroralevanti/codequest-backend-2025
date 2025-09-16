import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CommentsService } from '../comments/comments.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-posts.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User
  ) {
    return this.postsService.create(createPostDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  findAll(
    @Query() filterDto: FilterPostsDto,
    @CurrentUser() user?: User
  ) {
    return this.postsService.findAll(filterDto, user);
  }

  @Get('my-posts')
  @ApiOperation({ summary: 'Get current user posts' })
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  @ApiResponse({ status: 200, description: 'User posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyPosts(
    @Query() filterDto: FilterPostsDto,
    @CurrentUser() user: User
  ) {
    const myPostsFilter = { ...filterDto, authorId: user.id };
    return this.postsService.findAll(myPostsFilter, user);
  }

  @Get(':postId/comments')
  @ApiOperation({ summary: 'Get comments for a post (paginated)' })
  findComments(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.commentsService.findAllByPost(postId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Draft post access denied' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: User
  ) {
    return this.postsService.findOne(id, user);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a post by slug' })
  @ApiParam({ name: 'slug', description: 'Post slug', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Draft post access denied' })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: User
  ) {
    return this.postsService.findBySlug(slug, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the author or admin' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: User
  ) {
    return this.postsService.update(id, updatePostDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the author or admin' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.postsService.remove(id, user);
  }

  // Endpoints específicos para administradores
  @Get('admin/all')
  @Auth('admin')
  @ApiOperation({ summary: 'Get all posts including drafts (Admin only)' })
  @ApiResponse({ status: 200, description: 'All posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAllForAdmin(
    @Query() filterDto: FilterPostsDto,
    @CurrentUser() user: User
  ) {
    return this.postsService.findAll(filterDto, user);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a draft post' })
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post published successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the author or admin' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  publishPost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.postsService.update(id, { status: 'published' as any }, user);
  }

  @Patch(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a post (convert to draft)' })
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Optional admin Bearer token', required: false })
  @ApiParam({ name: 'id', description: 'Post ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post unpublished successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the author or admin' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  unpublishPost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ) {
    return this.postsService.update(id, { status: 'draft' as any }, user);
  }
}
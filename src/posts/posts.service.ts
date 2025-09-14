import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto, PostStatus } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-posts.dto';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { RolesService } from '../roles/services/roles.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const { categoryIds, tagIds, ...postData } = createPostDto;

    if (!postData.slug) postData.slug = this.generateSlug(postData.title);
    await this.validateUniqueSlug(postData.slug);

    const post = this.postRepository.create({
      ...postData,
      authorId: user.id,
      status: postData.status || PostStatus.DRAFT,
      publishedAt: postData.status === PostStatus.PUBLISHED ? new Date() : null,
    });

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }
      post.categories = categories;
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(tagIds) });
      if (tags.length !== tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
      post.tags = tags;
    }

    return await this.postRepository.save(post);
  }

  async findAll(filterDto: FilterPostsDto, currentUser?: User): Promise<{ posts: Post[]; total: number }> {
    const { limit = 10, offset = 0, search, status, authorId, categoryId, tagId, publishedAfter, publishedBefore } = filterDto;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .leftJoinAndSelect('post.tags', 'tags');

    await this.applyFilters(queryBuilder, {
      search,
      status,
      authorId,
      categoryId,
      tagId,
      publishedAfter,
      publishedBefore,
      currentUser
    });

    queryBuilder.orderBy('post.publishedAt', 'DESC').addOrderBy('post.createdAt', 'DESC');
    queryBuilder.skip(offset).take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();
    const postsWithCounts = await this.addPostCounts(posts, currentUser);

    return {
      posts: postsWithCounts,
      total,
    };
  }

  async findOne(id: string, currentUser?: User): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'categories', 'tags'],
    });

    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

    const isAdmin = currentUser ? await this.rolesService.userHasRole(currentUser.id, 'admin') : false;
    if (post.status === PostStatus.DRAFT && currentUser?.id !== post.authorId && !isAdmin) 
      throw new ForbiddenException('You do not have permission to view this draft post');

    const [postWithCounts] = await this.addPostCounts([post], currentUser);
    return postWithCounts;
  }

  async findBySlug(slug: string, currentUser?: User): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'categories', 'tags'],
    });

    if (!post) throw new NotFoundException(`Post with slug '${slug}' not found`);

    const isAdmin = currentUser ? await this.rolesService.userHasRole(currentUser.id, 'admin') : false;
    if (post.status === PostStatus.DRAFT && currentUser?.id !== post.authorId && !isAdmin) 
      throw new ForbiddenException('You do not have permission to view this draft post');

    const [postWithCounts] = await this.addPostCounts([post], currentUser);
    return postWithCounts;
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id);

    const isAdmin = await this.rolesService.userHasRole(user.id, 'admin');
    if (post.authorId !== user.id && !isAdmin) 
      throw new ForbiddenException('You do not have permission to update this post');

    const { categoryIds, tagIds, ...postData } = updatePostDto;
    if (postData.slug && postData.slug !== post.slug) 
      await this.validateUniqueSlug(postData.slug, id);

    if (postData.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) 
      (postData as any).publishedAt = new Date();

    Object.assign(post, postData);

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        const categories = await this.categoryRepository.findBy({ id: In(categoryIds) });
        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('One or more categories not found');
        }
        post.categories = categories;
      } else {
        post.categories = [];
      }
    }

    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        const tags = await this.tagRepository.findBy({ id: In(tagIds) });
        if (tags.length !== tagIds.length) {
          throw new BadRequestException('One or more tags not found');
        }
        post.tags = tags;
      } else {
        post.tags = [];
      }
    }

    return await this.postRepository.save(post);
  }

  async remove(id: string, user: User): Promise<void> {
    const post = await this.findOne(id);
    const isAdmin = await this.rolesService.userHasRole(user.id, 'admin');
    if (post.authorId !== user.id && !isAdmin) 
      throw new ForbiddenException('You do not have permission to delete this post');

    await this.postRepository.remove(post);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') 
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') 
      .trim();
  }

  private async validateUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const queryBuilder = this.postRepository.createQueryBuilder('post').where('post.slug = :slug', { slug });

    if (excludeId) queryBuilder.andWhere('post.id != :excludeId', { excludeId });

    const existingPost = await queryBuilder.getOne();
    if (existingPost) throw new BadRequestException(`Post with slug '${slug}' already exists`);
  }

  private async applyFilters(
    queryBuilder: SelectQueryBuilder<Post>,
    filters: {
      search?: string;
      status?: PostStatus;
      authorId?: string;
      categoryId?: string;
      tagId?: string;
      publishedAfter?: string;
      publishedBefore?: string;
      currentUser?: User;
    }
  ): Promise<void> {
    const { search, status, authorId, categoryId, tagId, publishedAfter, publishedBefore, currentUser } = filters;

    const isAdmin = currentUser ? await this.rolesService.userHasRole(currentUser.id, 'admin') : false;
    if (!status && !isAdmin) {
      queryBuilder.andWhere('post.status = :defaultStatus', { defaultStatus: PostStatus.PUBLISHED });
    } else if (status) {
      queryBuilder.andWhere('post.status = :status', { status });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (authorId) queryBuilder.andWhere('post.authorId = :authorId', { authorId });
    if (categoryId) queryBuilder.andWhere('categories.id = :categoryId', { categoryId });
    if (tagId) queryBuilder.andWhere('tags.id = :tagId', { tagId });
    if (publishedAfter) queryBuilder.andWhere('post.publishedAt >= :publishedAfter', { publishedAfter });
    if (publishedBefore) queryBuilder.andWhere('post.publishedAt <= :publishedBefore', { publishedBefore });
  }

  private async addPostCounts(posts: Post[], currentUser?: User): Promise<Post[]> {
    // Por ahora, establecer contadores en 0
    // Se implementarán cuando tengamos los módulos de likes y comments
    return posts.map(post => ({
      ...post,
      likesCount: 0,
      commentsCount: 0,
      isLikedByUser: false,
    }));
  }
}
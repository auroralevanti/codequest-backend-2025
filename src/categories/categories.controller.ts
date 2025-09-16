import { Controller, Post, Body, Get, Query, Param, ParseUUIDPipe, Patch, Delete, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CategoryResponseDto } from './dto/category-response.dto';
import { Response } from 'express';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @Auth('admin')
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Bearer token (admin required)', required: true })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateCategoryDto, @Res({ passthrough: true }) res: Response): Promise<CategoryResponseDto> {
    const created = await this.categoriesService.create(createDto) as any;
    res.setHeader('Location', `/categories/${created.id}`);
    return created;
  }

  @Get()
  @ApiOperation({ summary: 'List categories with pagination' })
  findAll(@Query() pagination: PaginationDto) {
    return this.categoriesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOneBySlug(slug);
  }
 

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @Auth('admin')
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Bearer token (admin required)', required: true })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @Auth('admin')
  @ApiBearerAuth('access-token')
  @ApiHeader({ name: 'authorization', description: 'Bearer token (admin required)', required: true })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}

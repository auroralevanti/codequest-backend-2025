import { Controller, Post, Body, Get, Query, Param, ParseUUIDPipe, Patch, Delete, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { TagResponseDto } from './dto/tag-response.dto';
import { Response } from 'express';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @Auth('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateTagDto, @Res({ passthrough: true }) res: Response): Promise<TagResponseDto> {
    const created = await this.tagsService.create(createDto);
    res.setHeader('Location', `/tags/${created.id}`);
    return created;
  }

  @Get()
  @ApiOperation({ summary: 'List tags with pagination' })
  findAll(@Query() pagination: PaginationDto) {
    return this.tagsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TagResponseDto> {
    return this.tagsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  findBySlug(@Param('slug') slug: string): Promise<TagResponseDto> {
    return this.tagsService.findOneBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @Auth('admin')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateTagDto): Promise<TagResponseDto> {
    return this.tagsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @Auth('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(id);
  }
}

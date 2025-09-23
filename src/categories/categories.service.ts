import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({ where: { slug: createDto.slug } });
    if (existing) throw new BadRequestException('Category slug already exists');

    const category = this.categoryRepository.create(createDto);
    const saved = await this.categoryRepository.save(category);
    return CategoryResponseDto.fromEntity(saved) as any;
  }

  async findAll(pagination: PaginationDto): Promise<{ data: CategoryResponseDto[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination;
    const [data, total] = await this.categoryRepository.findAndCount({ skip: offset, take: limit, order: { createdAt: 'DESC' } });
    return { data: data.map(d => CategoryResponseDto.fromEntity(d)), total };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    return CategoryResponseDto.fromEntity(category);
  }

  async update(id: string, updateDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const categoryEntity = await this.categoryRepository.findOneBy({ id });
    if (!categoryEntity) throw new NotFoundException('Category not found');
    Object.assign(categoryEntity, updateDto);
    const saved = await this.categoryRepository.save(categoryEntity);
    return CategoryResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepository.remove(category);
  }

  async findOneBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    return CategoryResponseDto.fromEntity(category);
  }
}

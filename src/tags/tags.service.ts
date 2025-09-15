import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TagResponseDto } from './dto/tag-response.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createDto: CreateTagDto): Promise<TagResponseDto> {
    const existing = await this.tagRepository.findOne({ where: { slug: createDto.slug } });
    if (existing) throw new BadRequestException('Tag slug already exists');

    const tag = this.tagRepository.create(createDto);
    const saved = await this.tagRepository.save(tag);
    return TagResponseDto.fromEntity(saved);
  }

  async findAll(pagination: PaginationDto): Promise<{ data: TagResponseDto[]; total: number }> {
    const { limit = 10, offset = 0 } = pagination;
    const [data, total] = await this.tagRepository.findAndCount({ skip: offset, take: limit, order: { createdAt: 'DESC' } });
    return { data: data.map(d => TagResponseDto.fromEntity(d)), total };
  }

  async findOne(id: string): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) throw new NotFoundException('Tag not found');
    return TagResponseDto.fromEntity(tag);
  }

  async findOneBySlug(slug: string): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOne({ where: { slug } });
    if (!tag) throw new NotFoundException('Tag not found');
    return TagResponseDto.fromEntity(tag);
  }

  async update(id: string, updateDto: UpdateTagDto): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) throw new NotFoundException('Tag not found');
    Object.assign(tag, updateDto);
    const saved = await this.tagRepository.save(tag);
    return TagResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.tagRepository.findOneBy({ id });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.tagRepository.remove(tag);
  }
}

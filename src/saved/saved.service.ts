import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedList } from './entities/saved-list.entity';
import { SavedPost } from './entities/saved-post.entity';
import { CreateSavedListDto } from './dto/create-saved-list.dto';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedList)
    private readonly savedListRepo: Repository<SavedList>,
    @InjectRepository(SavedPost)
    private readonly savedPostRepo: Repository<SavedPost>,
  ) {}

  async createList(userId: string, dto: CreateSavedListDto): Promise<SavedList> {
    const list = this.savedListRepo.create({ ...dto, userId });
    return this.savedListRepo.save(list);
  }

  async getLists(userId: string): Promise<SavedList[]> {
    return this.savedListRepo.find({ where: { userId } });
  }

  async deleteList(listId: string, userId: string): Promise<void> {
    const list = await this.savedListRepo.findOne({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');
    if (list.userId !== userId) throw new ForbiddenException('Not allowed');
    await this.savedPostRepo.delete({ listId });
    await this.savedListRepo.remove(list);
  }

  async addPostToList(userId: string, postId: string, listId?: string): Promise<SavedPost> {
    // If listId provided, check exists and belongs to user
    if (listId) {
      const list = await this.savedListRepo.findOne({ where: { id: listId } });
      if (!list) throw new NotFoundException('List not found');
      if (list.userId !== userId) throw new ForbiddenException('Not allowed to add to this list');
    }

    const exists = await this.savedPostRepo.findOne({ where: { postId, userId, listId } });
    if (exists) throw new BadRequestException('Post already saved in this list');

    const saved = this.savedPostRepo.create({ postId, userId, listId });
    return this.savedPostRepo.save(saved);
  }

  async removePostFromList(userId: string, postId: string, listId?: string): Promise<void> {
    const saved = await this.savedPostRepo.findOne({ where: { postId, userId, listId } });
    if (!saved) throw new NotFoundException('Saved post not found');
    await this.savedPostRepo.remove(saved);
  }

  async getPostsInList(listId: string, userId: string): Promise<SavedPost[]> {
    const list = await this.savedListRepo.findOne({ where: { id: listId } });
    if (!list) throw new NotFoundException('List not found');
    if (list.userId !== userId) throw new ForbiddenException('Not allowed');
    return this.savedPostRepo.find({ where: { listId }, order: { createdAt: 'DESC' } });
  }

  async getUserSavedPosts(userId: string): Promise<SavedPost[]> {
    return this.savedPostRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}

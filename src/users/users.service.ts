import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/services/roles.service';
import { User } from './entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Ensure roles field exists and default to 'user'
    const roleName = (createUserDto as any).roles || 'user';
    (createUserDto as any).roles = roleName;

    // Save user
    const user = await this.usersRepository.save(createUserDto as any);

    // Ensure role exists and link in user_roles
    try {
      await this.rolesService.addRoleToUser(user.id, roleName);
    } catch (err) {
      // If role linking fails, log but don't break user creation
      console.error('Failed to link role to user:', err.message || err);
    }

    return user;
  }

  async findAll( paginationDto: PaginationDto ): Promise<User[]> {

    const { offset, limit } = paginationDto;

    return await this.usersRepository.find({
      skip: offset,
      take: limit,
    });
    
  }

  async findOne(id: string): Promise<User> {
    return await this.usersRepository.findOneBy({ id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async blockUser(id: string): Promise<User> {
    throw new Error('Method not implemented.');
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findOneByDiscordId(discordId: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { discordId } });
  }

  async linkDiscordId(userId: string, discordId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { discordId });
  }

}

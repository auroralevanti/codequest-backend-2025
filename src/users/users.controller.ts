import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';

import { User } from './entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { IsPublic } from '../auth/decorators/is-public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth('admin')
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<User[]> {
    return this.usersService.findAll( paginationDto );
  }

  @Get(':id')
  @IsPublic() 
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @Auth('admin') // just admin users
  blockUser(@Param('id') id: string): Promise<User> {
    return this.usersService.blockUser(id);
  }

}

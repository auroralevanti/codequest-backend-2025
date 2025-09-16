import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';
import { RolesService } from '../roles/services/roles.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRole,
    ]),
  ],
  exports: [UsersService],
})
export class UsersModule {}

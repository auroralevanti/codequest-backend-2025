import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesService } from '../roles/services/roles.service';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../roles/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Role, UserRole]), AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService, RolesService],
  exports: [CommentsService],
})
export class CommentsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';
import { SavedList } from './entities/saved-list.entity';
import { SavedPost } from './entities/saved-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedList, SavedPost])],
  providers: [SavedService],
  controllers: [SavedController],
  exports: [SavedService],
})
export class SavedModule {}

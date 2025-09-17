import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SavedList } from './saved-list.entity';

@Entity({ name: 'saved_posts' })
export class SavedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'post_id' })
  postId: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'list_id', nullable: true })
  listId?: string;

  @ManyToOne(() => SavedList, { eager: false })
  @JoinColumn({ name: 'list_id' })
  list?: SavedList;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}

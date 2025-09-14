import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'timestamptz', name: 'published_at', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @JoinColumn({ name: 'author_id' })
  author: User;

  // Nota: Las relaciones con Comments y PostLike se añadirán cuando creemos esos módulos
  // @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  // comments: Comment[];

  // @OneToMany(() => PostLike, (like) => like.post, { cascade: true })
  // likes: PostLike[];

  @ManyToMany(() => Category, { cascade: false })
  @JoinTable({
    name: 'post_categories',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
  })
  categories: Category[];

  @ManyToMany(() => Tag, { cascade: false })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: Tag[];

  // Campos calculados (se pueden agregar en el servicio)
  likesCount?: number;
  commentsCount?: number;
  isLikedByUser?: boolean;
}

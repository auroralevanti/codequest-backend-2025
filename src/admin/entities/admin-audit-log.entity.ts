import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'admin_audit_logs' })
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'actor_user_id' })
  actorUserId: string;

  @Column({ type: 'varchar', length: 100, name: 'entity_type' })
  entityType: string;

  @Column({ type: 'varchar', length: 100, name: 'entity_id' })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  changes?: any;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}

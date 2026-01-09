import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('view_history')
export class ViewHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'session_id', type: 'varchar', length: 255 })
  sessionId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  path: string | null;

  @Column({ name: 'path_json', type: 'jsonb', nullable: true })
  pathJson: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

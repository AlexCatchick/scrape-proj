import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ScrapeJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ScrapeJobTargetType {
  NAVIGATION = 'navigation',
  CATEGORY = 'category',
  PRODUCT_LIST = 'product_list',
  PRODUCT_DETAIL = 'product_detail',
}

@Entity('scrape_job')
export class ScrapeJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'target_url', type: 'varchar', length: 500 })
  targetUrl: string;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: ScrapeJobTargetType,
  })
  targetType: ScrapeJobTargetType;

  @Index()
  @Column({
    type: 'enum',
    enum: ScrapeJobStatus,
    default: ScrapeJobStatus.PENDING,
  })
  status: ScrapeJobStatus;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @Column({ name: 'error_log', type: 'text', nullable: true })
  errorLog: string | null;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

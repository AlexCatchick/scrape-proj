import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('navigation')
export class Navigation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Index()
  @Column({ name: 'source_url', type: 'varchar', length: 500, unique: true })
  sourceUrl: string;

  @Column({ name: 'last_scraped_at', type: 'timestamp', nullable: true })
  lastScrapedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Category, (category) => category.navigation)
  categories: Category[];
}

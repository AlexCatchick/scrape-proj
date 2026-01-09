import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductDetail } from './product-detail.entity';
import { Review } from './review.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'source_id', type: 'varchar', length: 255, unique: true })
  sourceId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'GBP' })
  currency: string;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Index()
  @Column({ name: 'source_url', type: 'varchar', length: 500, unique: true })
  sourceUrl: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  condition: string | null;

  @Column({ name: 'in_stock', type: 'boolean', default: true })
  inStock: boolean;

  @Index()
  @Column({ name: 'last_scraped_at', type: 'timestamp', nullable: true })
  lastScrapedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToOne(() => ProductDetail, (detail) => detail.product, {
    cascade: true,
  })
  detail: ProductDetail;

  @OneToMany(() => Review, (review) => review.product, {
    cascade: true,
  })
  reviews: Review[];
}

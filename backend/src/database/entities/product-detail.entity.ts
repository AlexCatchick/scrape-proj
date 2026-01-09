import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_detail')
export class ProductDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, any> | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  isbn: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher: string | null;

  @Column({ name: 'publication_date', type: 'varchar', length: 100, nullable: true })
  publicationDate: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  format: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language: string | null;

  @Column({ type: 'int', nullable: true })
  pages: number | null;

  @Column({ name: 'ratings_avg', type: 'decimal', precision: 3, scale: 2, nullable: true })
  ratingsAvg: number | null;

  @Column({ name: 'reviews_count', type: 'int', default: 0 })
  reviewsCount: number;

  @Column({ name: 'related_product_ids', type: 'jsonb', nullable: true })
  relatedProductIds: string[] | null;

  @OneToOne(() => Product, (product) => product.detail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string | null;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  text: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string | null;

  @Column({ name: 'review_date', type: 'varchar', length: 100, nullable: true })
  reviewDate: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

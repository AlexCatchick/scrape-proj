import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Navigation } from './navigation.entity';
import { Product } from './product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'navigation_id', type: 'uuid', nullable: true })
  navigationId: string | null;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Index()
  @Column({ name: 'source_url', type: 'varchar', length: 500, unique: true })
  sourceUrl: string;

  @Column({ name: 'product_count', type: 'int', nullable: true })
  productCount: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'last_scraped_at', type: 'timestamp', nullable: true })
  lastScrapedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Navigation, (navigation) => navigation.categories, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'navigation_id' })
  navigation: Navigation;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

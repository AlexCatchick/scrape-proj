import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductDetail, Review, ScrapeJobTargetType } from '../../database/entities';
import { ScrapeService } from '../scrape/scrape.service';
import { QueryProductsDto } from './dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private scrapeService: ScrapeService,
  ) {}

  async findAll(query: QueryProductsDto): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { categoryId, search, page = 1, limit = 20, sortBy = 'title', sortOrder = 'ASC' } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.author ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Validate sortBy field
    const allowedSortFields = ['title', 'price', 'author', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'title';

    queryBuilder
      .orderBy(`product.${sortField}`, sortOrder === 'DESC' ? 'DESC' : 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['detail', 'reviews', 'category'],
    });

    if (product) {
      // Check if we need to fetch product details
      if (!product.detail || this.scrapeService.isCacheExpired(product.lastScrapedAt)) {
        // Trigger background scrape for product details
        this.triggerDetailScrape(product.id, product.sourceUrl).catch((e) =>
          this.logger.error(`Background product detail scrape failed: ${e.message}`),
        );
      }
    }

    return product;
  }

  async findBySourceId(sourceId: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { sourceId },
      relations: ['detail', 'reviews', 'category'],
    });
  }

  async getProductDetail(productId: string): Promise<ProductDetail | null> {
    return this.productDetailRepository.findOne({
      where: { productId },
    });
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    const detail = await this.productDetailRepository.findOne({
      where: { productId },
    });

    if (!detail?.relatedProductIds?.length) {
      return [];
    }

    // Get related products by source IDs
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.sourceId IN (:...sourceIds)', {
        sourceIds: detail.relatedProductIds,
      })
      .take(10)
      .getMany();

    return products;
  }

  async triggerListScrape(sourceUrl: string, categoryId?: string): Promise<void> {
    await this.scrapeService.enqueueScrapeJob(
      sourceUrl,
      ScrapeJobTargetType.PRODUCT_LIST,
      categoryId,
    );
  }

  async triggerDetailScrape(productId: string, sourceUrl: string): Promise<void> {
    await this.scrapeService.enqueueScrapeJob(
      sourceUrl,
      ScrapeJobTargetType.PRODUCT_DETAIL,
      productId,
    );
  }
}

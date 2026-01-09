import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category, Navigation, ScrapeJobTargetType } from '../../database/entities';
import { ScrapeService } from '../scrape/scrape.service';
import { QueryCategoriesDto } from './dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
    private scrapeService: ScrapeService,
  ) {}

  async findAll(query: QueryCategoriesDto): Promise<{ data: Category[]; total: number }> {
    const { navigationId, parentId, page = 1, limit = 50 } = query;

    // First, check if we have any categories at all
    const totalCategories = await this.categoryRepository.count();
    if (totalCategories === 0) {
      // Auto-sync from navigation if no categories exist
      this.logger.log('No categories found, auto-syncing from navigation...');
      await this.syncFromNavigation();
    }

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (navigationId) {
      queryBuilder.andWhere('category.navigationId = :navigationId', { navigationId });
    }

    if (parentId) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    } else if (parentId === null) {
      // Get only top-level categories
      queryBuilder.andWhere('category.parentId IS NULL');
    }

    queryBuilder
      .orderBy('category.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Check if any data is stale and trigger background refresh
    if (data.length > 0) {
      const anyStale = data.some((cat) =>
        this.scrapeService.isCacheExpired(cat.lastScrapedAt),
      );
      if (anyStale && data[0].sourceUrl) {
        this.triggerScrape(data[0].sourceUrl, data[0].navigationId || undefined).catch((e) =>
          this.logger.error(`Background category scrape failed: ${e.message}`),
        );
      }
    }

    return { data, total };
  }

  async findOne(id: string): Promise<Category | null> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'navigation', 'parent'],
    });

    if (category && this.scrapeService.isCacheExpired(category.lastScrapedAt)) {
      // Trigger background refresh
      this.triggerScrape(category.sourceUrl, category.navigationId || undefined).catch((e) =>
        this.logger.error(`Background category scrape failed: ${e.message}`),
      );
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['children', 'navigation', 'parent'],
    });
  }

  async getBreadcrumbs(categoryId: string): Promise<Category[]> {
    const breadcrumbs: Category[] = [];
    let currentCategory = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    while (currentCategory) {
      breadcrumbs.unshift(currentCategory);
      if (currentCategory.parentId) {
        currentCategory = await this.categoryRepository.findOne({
          where: { id: currentCategory.parentId },
        });
      } else {
        break;
      }
    }

    return breadcrumbs;
  }

  async triggerScrape(sourceUrl: string, navigationId?: string): Promise<void> {
    await this.scrapeService.enqueueScrapeJob(
      sourceUrl,
      ScrapeJobTargetType.CATEGORY,
      navigationId,
    );
  }

  /**
   * Sync navigation items as top-level categories
   * This creates categories from existing navigation data
   */
  async syncFromNavigation(): Promise<{ synced: number; total: number }> {
    const navigations = await this.navigationRepository.find();
    let synced = 0;

    for (const nav of navigations) {
      try {
        const existing = await this.categoryRepository.findOne({
          where: { sourceUrl: nav.sourceUrl },
        });

        if (existing) {
          // Update existing category
          await this.categoryRepository.update(existing.id, {
            title: nav.title,
            slug: nav.slug,
            navigationId: nav.id,
            lastScrapedAt: nav.lastScrapedAt,
          });
          this.logger.debug(`Updated category from navigation: ${nav.title}`);
        } else {
          // Create new category from navigation
          await this.categoryRepository.save({
            title: nav.title,
            slug: nav.slug,
            sourceUrl: nav.sourceUrl,
            navigationId: nav.id,
            lastScrapedAt: nav.lastScrapedAt,
          });
          this.logger.debug(`Created category from navigation: ${nav.title}`);
          synced++;
        }
      } catch (error) {
        this.logger.error(`Failed to sync category ${nav.title}: ${error}`);
      }
    }

    this.logger.log(`Synced ${synced} new categories from ${navigations.length} navigation items`);
    return { synced, total: navigations.length };
  }
}

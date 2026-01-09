import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from '../../database/entities';
import { ScrapeService } from '../scrape/scrape.service';
import { ScrapeJobTargetType } from '../../database/entities';

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);

  constructor(
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
    private scrapeService: ScrapeService,
  ) {}

  async findAll(): Promise<Navigation[]> {
    const navigations = await this.navigationRepository.find({
      order: { title: 'ASC' },
    });

    // Check if we need to trigger a scrape
    if (navigations.length === 0) {
      this.logger.log('No navigation data found, triggering scrape');
      await this.triggerScrape();
    } else {
      // Check if data is stale
      const anyStale = navigations.some((nav) =>
        this.scrapeService.isCacheExpired(nav.lastScrapedAt),
      );
      if (anyStale) {
        this.logger.log('Navigation data is stale, triggering background scrape');
        // Don't await - let it run in background
        this.triggerScrape().catch((e) =>
          this.logger.error(`Background scrape failed: ${e.message}`),
        );
      }
    }

    return navigations;
  }

  async findOne(id: string): Promise<Navigation | null> {
    return this.navigationRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
  }

  async findBySlug(slug: string): Promise<Navigation | null> {
    return this.navigationRepository.findOne({
      where: { slug },
      relations: ['categories'],
    });
  }

  async triggerScrape(): Promise<void> {
    await this.scrapeService.enqueueScrapeJob(
      'https://www.worldofbooks.com/',
      ScrapeJobTargetType.NAVIGATION,
    );
  }
}

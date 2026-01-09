import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Category } from '../../../database/entities';
import { ScrapeJobData } from '../scrape.service';

interface CategoryItem {
  title: string;
  slug: string;
  sourceUrl: string;
  productCount?: number;
  imageUrl?: string;
}

@Injectable()
export class CategoryScraper {
  private readonly logger = new Logger(CategoryScraper.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async scrape(jobData: ScrapeJobData): Promise<void> {
    this.logger.log(`Starting category scrape for ${jobData.targetUrl}`);
    const categories: CategoryItem[] = [];

    const config = new Configuration({
      persistStorage: false,
    });

    const crawler = new PlaywrightCrawler(
      {
        headless: true,
        maxRequestsPerCrawl: 1,
        requestHandlerTimeoutSecs: 60,
        navigationTimeoutSecs: 30,

        async requestHandler({ page, log }) {
          log.info(`Scraping categories from ${jobData.targetUrl}`);

          // Wait for content to load
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000); // Allow dynamic content to load

          // Extract categories and subcategories
          const items = await page.evaluate(() => {
            const categoryItems: Array<{
              title: string;
              href: string;
              productCount?: number;
              imageUrl?: string;
            }> = [];

            // Try multiple selector strategies
            const selectors = [
              '.category-card',
              '.category-item',
              '.subcategory-link',
              '[data-testid="category"]',
              '.category-list a',
              '.browse-categories a',
            ];

            // Look for category cards/links
            const categoryLinks = document.querySelectorAll('a[href*="/category"]');
            categoryLinks.forEach((link) => {
              const anchor = link as HTMLAnchorElement;
              const href = anchor.getAttribute('href');
              const title = anchor.textContent?.trim();

              // Try to find product count
              const countMatch = title?.match(/\((\d+)\)/);
              const productCount = countMatch ? parseInt(countMatch[1], 10) : undefined;
              const cleanTitle = title?.replace(/\(\d+\)/, '').trim();

              // Try to find associated image
              const img = anchor.querySelector('img');
              const imageUrl = img?.getAttribute('src') || undefined;

              if (href && cleanTitle && !categoryItems.find((c) => c.href === href)) {
                categoryItems.push({
                  title: cleanTitle,
                  href,
                  productCount,
                  imageUrl,
                });
              }
            });

            return categoryItems;
          });

          for (const item of items) {
            const fullUrl = item.href.startsWith('http')
              ? item.href
              : `https://www.worldofbooks.com${item.href}`;

            // Generate slug from URL
            const urlPath = new URL(fullUrl).pathname;
            const slug = urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'category';

            categories.push({
              title: item.title,
              slug,
              sourceUrl: fullUrl,
              productCount: item.productCount,
              imageUrl: item.imageUrl,
            });
          }

          log.info(`Found ${categories.length} categories`);
        },
      },
      config,
    );

    try {
      await crawler.run([jobData.targetUrl]);
    } finally {
      await crawler.teardown();
    }

    // Save to database
    for (const item of categories) {
      try {
        const existing = await this.categoryRepository.findOne({
          where: { sourceUrl: item.sourceUrl },
        });

        if (existing) {
          await this.categoryRepository.update(existing.id, {
            title: item.title,
            slug: item.slug,
            productCount: item.productCount,
            imageUrl: item.imageUrl,
            lastScrapedAt: new Date(),
          });
          this.logger.debug(`Updated category: ${item.title}`);
        } else {
          await this.categoryRepository.save({
            title: item.title,
            slug: item.slug,
            sourceUrl: item.sourceUrl,
            productCount: item.productCount,
            imageUrl: item.imageUrl,
            navigationId: jobData.referenceId || null,
            lastScrapedAt: new Date(),
          });
          this.logger.debug(`Created category: ${item.title}`);
        }
      } catch (error) {
        this.logger.error(`Failed to save category ${item.title}: ${error}`);
      }
    }

    this.logger.log(`Category scrape completed. Saved ${categories.length} items`);
  }
}

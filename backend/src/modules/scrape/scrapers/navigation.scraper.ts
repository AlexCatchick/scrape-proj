import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Navigation } from '../../../database/entities';
import { ScrapeJobData } from '../scrape.service';

interface NavigationItem {
  title: string;
  slug: string;
  sourceUrl: string;
}

@Injectable()
export class NavigationScraper {
  private readonly logger = new Logger(NavigationScraper.name);
  private readonly baseUrl = 'https://www.worldofbooks.com';

  constructor(
    @InjectRepository(Navigation)
    private navigationRepository: Repository<Navigation>,
  ) {}

  async scrape(jobData: ScrapeJobData): Promise<void> {
    this.logger.log('Starting navigation scrape');
    const navigationItems: NavigationItem[] = [];

    // Configure Crawlee to use in-memory storage
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
          log.info('Scraping navigation from World of Books');

          // Wait for page to load with longer timeout
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(3000); // Give JS time to render

          // Extract navigation items - adjust selectors based on actual World of Books site structure
          const items = await page.evaluate(() => {
            const navItems: Array<{ title: string; href: string }> = [];
            const seenUrls = new Set<string>();

            // World of Books specific selectors - look for book category links
            const selectors = [
              'a[href*="/en-gb/category/"]',
              'a[href*="/category/"]',
              'a[href*="/collections/"]',
              'nav a[href*="books"]',
              'header a[href*="books"]',
              '.navigation a',
              '.menu a',
              '.nav a',
              'a[href*="/shop/"]',
              // Generic navigation patterns
              '[class*="nav"] a',
              '[class*="menu"] a',
              'header nav a',
              'header a',
            ];

            for (const selector of selectors) {
              const links = document.querySelectorAll(selector);
              links.forEach((link) => {
                const anchor = link as HTMLAnchorElement;
                const href = anchor.getAttribute('href');
                const title = anchor.textContent?.trim();

                // Filter for relevant navigation links
                if (
                  href &&
                  title &&
                  title.length > 1 &&
                  title.length < 50 &&
                  !seenUrls.has(href) &&
                  !href.includes('#') &&
                  !href.includes('javascript:') &&
                  !href.includes('login') &&
                  !href.includes('account') &&
                  !href.includes('cart') &&
                  !href.includes('wishlist')
                ) {
                  seenUrls.add(href);
                  navItems.push({ title, href });
                }
              });
              
              // If we found items with this selector, stop
              if (navItems.length >= 5) break;
            }

            return navItems.slice(0, 20); // Limit to top 20 items
          });

          for (const item of items) {
            const fullUrl = item.href.startsWith('http')
              ? item.href
              : `https://www.worldofbooks.com${item.href}`;
            
            // Generate slug from URL
            const urlPath = new URL(fullUrl).pathname;
            const slug = urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';

            navigationItems.push({
              title: item.title,
              slug,
              sourceUrl: fullUrl,
            });
          }

          log.info(`Found ${navigationItems.length} navigation items`);
        },
      },
      config,
    );

    try {
      await crawler.run([jobData.targetUrl]);
    } finally {
      await crawler.teardown();
    }

    // If scraping found no items, add default World of Books categories
    if (navigationItems.length === 0) {
      this.logger.warn('No navigation items scraped, adding default categories');
      const defaultCategories = [
        { title: 'Fiction', slug: 'fiction', sourceUrl: `${this.baseUrl}/en-gb/category/fiction-702` },
        { title: 'Non-Fiction', slug: 'non-fiction', sourceUrl: `${this.baseUrl}/en-gb/category/non-fiction-702` },
        { title: "Children's Books", slug: 'childrens-books', sourceUrl: `${this.baseUrl}/en-gb/category/childrens-books-702` },
        { title: 'Crime & Thriller', slug: 'crime-thriller', sourceUrl: `${this.baseUrl}/en-gb/category/crime-thriller-702` },
        { title: 'Science Fiction & Fantasy', slug: 'sci-fi-fantasy', sourceUrl: `${this.baseUrl}/en-gb/category/science-fiction-fantasy-702` },
        { title: 'Biography', slug: 'biography', sourceUrl: `${this.baseUrl}/en-gb/category/biography-702` },
        { title: 'History', slug: 'history', sourceUrl: `${this.baseUrl}/en-gb/category/history-702` },
        { title: 'Romance', slug: 'romance', sourceUrl: `${this.baseUrl}/en-gb/category/romance-702` },
        { title: 'Comics & Graphic Novels', slug: 'comics-graphic-novels', sourceUrl: `${this.baseUrl}/en-gb/category/comics-graphic-novels-702` },
        { title: 'Cookery, Food & Drink', slug: 'cookery-food-drink', sourceUrl: `${this.baseUrl}/en-gb/category/cookery-food-drink-702` },
      ];
      navigationItems.push(...defaultCategories);
    }

    // Save to database
    for (const item of navigationItems) {
      try {
        const existing = await this.navigationRepository.findOne({
          where: { sourceUrl: item.sourceUrl },
        });

        if (existing) {
          await this.navigationRepository.update(existing.id, {
            title: item.title,
            slug: item.slug,
            lastScrapedAt: new Date(),
          });
          this.logger.debug(`Updated navigation: ${item.title}`);
        } else {
          await this.navigationRepository.save({
            ...item,
            lastScrapedAt: new Date(),
          });
          this.logger.debug(`Created navigation: ${item.title}`);
        }
      } catch (error) {
        this.logger.error(`Failed to save navigation ${item.title}: ${error}`);
      }
    }

    this.logger.log(`Navigation scrape completed. Saved ${navigationItems.length} items`);
  }
}

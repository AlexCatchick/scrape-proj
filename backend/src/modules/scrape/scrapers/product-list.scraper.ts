import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Product } from '../../../database/entities';
import { ScrapeJobData } from '../scrape.service';

interface ProductItem {
  sourceId: string;
  title: string;
  author?: string;
  price: number;
  currency: string;
  originalPrice?: number;
  imageUrl?: string;
  sourceUrl: string;
  condition?: string;
}

@Injectable()
export class ProductListScraper {
  private readonly logger = new Logger(ProductListScraper.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async scrape(jobData: ScrapeJobData): Promise<void> {
    this.logger.log(`Starting product list scrape for ${jobData.targetUrl}`);
    const products: ProductItem[] = [];

    const config = new Configuration({
      persistStorage: false,
    });

    const crawler = new PlaywrightCrawler(
      {
        headless: true,
        maxRequestsPerCrawl: 1,
        requestHandlerTimeoutSecs: 90,
        navigationTimeoutSecs: 30,

        async requestHandler({ page, log }) {
          log.info(`Scraping product list from ${jobData.targetUrl}`);

          // Wait for products to load
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(3000);

          // Scroll to load more products if lazy-loaded
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });
          await page.waitForTimeout(1000);

          // Extract products - World of Books specific selectors
          const items = await page.evaluate(() => {
            const productItems: Array<{
              title: string;
              author?: string;
              price: string;
              originalPrice?: string;
              imageUrl?: string;
              href: string;
              condition?: string;
            }> = [];

            // World of Books uses links to /products/ pages with associated images
            // Find all product links that contain /products/ in the URL
            const productLinks = document.querySelectorAll('a[href*="/products/"]');
            const processedUrls = new Set<string>();

            productLinks.forEach((link) => {
              const href = (link as HTMLAnchorElement).getAttribute('href');
              if (!href || processedUrls.has(href)) return;
              
              // Skip non-product links (like policy/help links)
              if (href.includes('/pages/') || href.includes('/policies/')) return;

              // Find the product card container - walk up to find parent with image
              let container: Element | null = link;
              let imageEl: Element | null = null;
              
              // Try to find image within the link first
              imageEl = link.querySelector('img');
              
              // If no image in link, check siblings and parent containers
              if (!imageEl) {
                let parent = link.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                  imageEl = parent.querySelector('img[src*="worldofbooks.com/images"]');
                  if (imageEl) {
                    container = parent;
                    break;
                  }
                  parent = parent.parentElement;
                }
              }

              // Get title from link text or h3
              const titleEl = link.querySelector('h3, h2') || link;
              const title = titleEl?.textContent?.trim();
              
              if (!title || title.length < 2) return;
              
              // Skip if this looks like a category, navigation, or promotional link
              const lowerTitle = title.toLowerCase();
              if (lowerTitle.includes('see all') || 
                  lowerTitle.includes('load more') ||
                  lowerTitle.includes('view all') ||
                  lowerTitle.includes('join now') ||
                  lowerTitle.includes('subscribe') ||
                  lowerTitle.includes('sign up') ||
                  lowerTitle === 'plus' ||
                  href.includes('world-of-books-plus')) return;

              processedUrls.add(href);

              // Find author - usually text near the title but not the price
              let author: string | undefined;
              if (container) {
                // Look for text nodes that could be author names
                const textNodes = Array.from(container.querySelectorAll('*')).filter(el => {
                  const text = el.textContent?.trim() || '';
                  return text.length > 0 && 
                         text.length < 100 && 
                         !text.includes('£') && 
                         !text.includes('Add') &&
                         !text.includes('Basket') &&
                         !text.includes('Buy') &&
                         text !== title;
                });
                // Author is typically the element right after title
                for (const node of textNodes) {
                  const text = node.textContent?.trim() || '';
                  if (text && text !== title && !text.includes('£') && text.length < 60) {
                    // Check if it looks like an author name (contains letters, not just symbols)
                    if (/[a-zA-Z]{2,}/.test(text) && !text.includes('Free') && !text.includes('delivery')) {
                      author = text.replace(/^by\s+/i, '');
                      break;
                    }
                  }
                }
              }

              // Find price
              let price = '0';
              if (container) {
                const priceMatch = container.textContent?.match(/£[\d.]+/);
                if (priceMatch) {
                  price = priceMatch[0];
                }
              }

              // Get image URL
              const imageUrl = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src');

              productItems.push({
                title,
                author,
                price,
                originalPrice: undefined,
                imageUrl: imageUrl || undefined,
                href,
                condition: 'Used - Good', // World of Books default
              });
            });

            return productItems;
          });

          for (const item of items) {
            const fullUrl = item.href.startsWith('http')
              ? item.href
              : `https://www.worldofbooks.com${item.href}`;

            // Extract source ID from URL
            const urlParts = fullUrl.split('/');
            const sourceId = urlParts[urlParts.length - 1] || `wob-${Date.now()}`;

            // Parse price
            const priceMatch = item.price.match(/[\d.]+/);
            const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

            // Detect currency
            const currency = item.price.includes('£') ? 'GBP' : 
                           item.price.includes('$') ? 'USD' : 
                           item.price.includes('€') ? 'EUR' : 'GBP';

            // Parse original price
            let originalPrice: number | undefined;
            if (item.originalPrice) {
              const origMatch = item.originalPrice.match(/[\d.]+/);
              originalPrice = origMatch ? parseFloat(origMatch[0]) : undefined;
            }

            products.push({
              sourceId,
              title: item.title,
              author: item.author,
              price,
              currency,
              originalPrice,
              imageUrl: item.imageUrl,
              sourceUrl: fullUrl,
              condition: item.condition,
            });
          }

          log.info(`Found ${products.length} products`);
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
    for (const item of products) {
      try {
        const existing = await this.productRepository.findOne({
          where: { sourceId: item.sourceId },
        });

        if (existing) {
          await this.productRepository.update(existing.id, {
            ...item,
            categoryId: jobData.referenceId || existing.categoryId,
            lastScrapedAt: new Date(),
          });
          this.logger.debug(`Updated product: ${item.title}`);
        } else {
          await this.productRepository.save({
            ...item,
            categoryId: jobData.referenceId || null,
            lastScrapedAt: new Date(),
          });
          this.logger.debug(`Created product: ${item.title}`);
        }
      } catch (error) {
        this.logger.error(`Failed to save product ${item.title}: ${error}`);
      }
    }

    this.logger.log(`Product list scrape completed. Saved ${products.length} items`);
  }
}

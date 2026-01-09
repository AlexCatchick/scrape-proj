import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import { Product, ProductDetail, Review } from '../../../database/entities';
import { ScrapeJobData } from '../scrape.service';

interface ProductDetailData {
  description?: string;
  isbn?: string;
  publisher?: string;
  publicationDate?: string;
  format?: string;
  language?: string;
  pages?: number;
  specs?: Record<string, any>;
  ratingsAvg?: number;
  reviewsCount?: number;
  relatedProductIds?: string[];
}

interface ReviewData {
  author?: string;
  rating: number;
  text?: string;
  title?: string;
  reviewDate?: string;
}

@Injectable()
export class ProductDetailScraper {
  private readonly logger = new Logger(ProductDetailScraper.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductDetail)
    private productDetailRepository: Repository<ProductDetail>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async scrape(jobData: ScrapeJobData): Promise<void> {
    this.logger.log(`Starting product detail scrape for ${jobData.targetUrl}`);
    
    let productDetail: ProductDetailData | null = null;
    const reviews: ReviewData[] = [];
    const relatedProducts: string[] = [];

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
          log.info(`Scraping product details from ${jobData.targetUrl}`);

          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);

          // Extract product details
          const details = await page.evaluate(() => {
            const result: Record<string, any> = {};

            // Description
            const descEl = document.querySelector(
              '.product-description, .description, [data-testid="description"], .synopsis'
            );
            result.description = descEl?.textContent?.trim();

            // Product specs/metadata table
            const specRows = document.querySelectorAll(
              '.product-specs tr, .product-info tr, dl dt, .specs-table tr'
            );
            const specs: Record<string, string> = {};

            specRows.forEach((row) => {
              const label = row.querySelector('th, dt')?.textContent?.trim()?.toLowerCase();
              const value = row.querySelector('td, dd')?.textContent?.trim();

              if (label && value) {
                specs[label] = value;

                // Map common fields
                if (label.includes('isbn')) result.isbn = value;
                if (label.includes('publisher')) result.publisher = value;
                if (label.includes('publication') || label.includes('date')) {
                  result.publicationDate = value;
                }
                if (label.includes('format')) result.format = value;
                if (label.includes('language')) result.language = value;
                if (label.includes('pages') || label.includes('page count')) {
                  const pages = parseInt(value, 10);
                  if (!isNaN(pages)) result.pages = pages;
                }
              }
            });

            result.specs = specs;

            // Rating
            const ratingEl = document.querySelector(
              '.rating, .product-rating, [data-testid="rating"]'
            );
            const ratingText = ratingEl?.textContent?.trim();
            if (ratingText) {
              const ratingMatch = ratingText.match(/([\d.]+)/);
              if (ratingMatch) {
                result.ratingsAvg = parseFloat(ratingMatch[1]);
              }
            }

            // Reviews count
            const reviewCountEl = document.querySelector(
              '.review-count, .reviews-count, [data-testid="review-count"]'
            );
            const reviewCountText = reviewCountEl?.textContent?.trim();
            if (reviewCountText) {
              const countMatch = reviewCountText.match(/(\d+)/);
              if (countMatch) {
                result.reviewsCount = parseInt(countMatch[1], 10);
              }
            }

            return result;
          });

          productDetail = {
            description: details.description,
            isbn: details.isbn,
            publisher: details.publisher,
            publicationDate: details.publicationDate,
            format: details.format,
            language: details.language,
            pages: details.pages,
            specs: details.specs,
            ratingsAvg: details.ratingsAvg,
            reviewsCount: details.reviewsCount || 0,
          };

          // Extract reviews
          const reviewElements = await page.evaluate(() => {
            const reviewItems: Array<{
              author?: string;
              rating?: number;
              text?: string;
              title?: string;
              date?: string;
            }> = [];

            const reviewCards = document.querySelectorAll(
              '.review, .review-item, [data-testid="review"]'
            );

            reviewCards.forEach((card) => {
              const authorEl = card.querySelector('.author, .reviewer-name');
              const ratingEl = card.querySelector('.rating, .review-rating');
              const textEl = card.querySelector('.review-text, .review-content, p');
              const titleEl = card.querySelector('.review-title, h4');
              const dateEl = card.querySelector('.review-date, .date');

              const ratingText = ratingEl?.textContent?.trim();
              let rating = 0;
              if (ratingText) {
                const match = ratingText.match(/([\d.]+)/);
                rating = match ? parseFloat(match[1]) : 0;
              }

              reviewItems.push({
                author: authorEl?.textContent?.trim(),
                rating,
                text: textEl?.textContent?.trim(),
                title: titleEl?.textContent?.trim(),
                date: dateEl?.textContent?.trim(),
              });
            });

            return reviewItems;
          });

          for (const review of reviewElements) {
            if (review.rating || review.text) {
              reviews.push({
                author: review.author,
                rating: review.rating || 0,
                text: review.text,
                title: review.title,
                reviewDate: review.date,
              });
            }
          }

          // Extract related products
          const relatedElements = await page.evaluate(() => {
            const related: string[] = [];

            const relatedLinks = document.querySelectorAll(
              '.related-products a, .recommendations a, [data-testid="related"] a'
            );

            relatedLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href) {
                const parts = href.split('/');
                const id = parts[parts.length - 1];
                if (id && !related.includes(id)) {
                  related.push(id);
                }
              }
            });

            return related;
          });

          relatedProducts.push(...relatedElements);
          if (productDetail) {
            productDetail.relatedProductIds = relatedProducts;
          }

          log.info(`Extracted product details with ${reviews.length} reviews`);
        },
      },
      config,
    );

    try {
      await crawler.run([jobData.targetUrl]);
    } finally {
      await crawler.teardown();
    }

    // Find the product by reference ID or source URL
    let product: Product | null = null;

    if (jobData.referenceId) {
      product = await this.productRepository.findOne({
        where: { id: jobData.referenceId },
      });
    }

    if (!product) {
      // Try to find by source URL
      product = await this.productRepository.findOne({
        where: { sourceUrl: jobData.targetUrl },
      });
    }

    if (!product) {
      this.logger.warn(`Product not found for URL: ${jobData.targetUrl}`);
      return;
    }

    // Save product details
    if (productDetail) {
      try {
        const existingDetail = await this.productDetailRepository.findOne({
          where: { productId: product.id },
        });

        if (existingDetail) {
          await this.productDetailRepository.update(existingDetail.id, productDetail as any);
          this.logger.debug(`Updated product detail for: ${product.title}`);
        } else {
          await this.productDetailRepository.save({
            productId: product.id,
            ...(productDetail as any),
          });
          this.logger.debug(`Created product detail for: ${product.title}`);
        }
      } catch (error) {
        this.logger.error(`Failed to save product detail: ${error}`);
      }
    }

    // Save reviews
    for (const reviewData of reviews) {
      try {
        // Avoid duplicate reviews (simple check)
        const existingReview = await this.reviewRepository.findOne({
          where: {
            productId: product.id,
            author: reviewData.author,
            text: reviewData.text,
          },
        });

        if (!existingReview) {
          await this.reviewRepository.save({
            productId: product.id,
            ...reviewData,
          });
          this.logger.debug(`Saved review for: ${product.title}`);
        }
      } catch (error) {
        this.logger.error(`Failed to save review: ${error}`);
      }
    }

    // Update product last scraped timestamp
    await this.productRepository.update(product.id, {
      lastScrapedAt: new Date(),
    });

    this.logger.log(`Product detail scrape completed for: ${product.title}`);
  }
}

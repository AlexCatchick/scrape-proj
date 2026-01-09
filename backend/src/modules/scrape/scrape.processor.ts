import { Process, Processor, OnQueueError, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ScrapeService, ScrapeJobData } from './scrape.service';
import { ScrapeJobStatus, ScrapeJobTargetType } from '../../database/entities';
import { NavigationScraper } from './scrapers/navigation.scraper';
import { CategoryScraper } from './scrapers/category.scraper';
import { ProductListScraper } from './scrapers/product-list.scraper';
import { ProductDetailScraper } from './scrapers/product-detail.scraper';

@Processor('scrape')
export class ScrapeProcessor {
  private readonly logger = new Logger(ScrapeProcessor.name);

  constructor(
    private readonly scrapeService: ScrapeService,
    private readonly navigationScraper: NavigationScraper,
    private readonly categoryScraper: CategoryScraper,
    private readonly productListScraper: ProductListScraper,
    private readonly productDetailScraper: ProductDetailScraper,
  ) {}

  @Process(ScrapeJobTargetType.NAVIGATION)
  async processNavigation(job: Job<ScrapeJobData>) {
    this.logger.log(`Processing navigation scrape job ${job.data.jobId}`);
    await this.processJob(job, () => this.navigationScraper.scrape(job.data));
  }

  @Process(ScrapeJobTargetType.CATEGORY)
  async processCategory(job: Job<ScrapeJobData>) {
    this.logger.log(`Processing category scrape job ${job.data.jobId}`);
    await this.processJob(job, () => this.categoryScraper.scrape(job.data));
  }

  @Process(ScrapeJobTargetType.PRODUCT_LIST)
  async processProductList(job: Job<ScrapeJobData>) {
    this.logger.log(`Processing product list scrape job ${job.data.jobId}`);
    await this.processJob(job, () => this.productListScraper.scrape(job.data));
  }

  @Process(ScrapeJobTargetType.PRODUCT_DETAIL)
  async processProductDetail(job: Job<ScrapeJobData>) {
    this.logger.log(`Processing product detail scrape job ${job.data.jobId}`);
    await this.processJob(job, () => this.productDetailScraper.scrape(job.data));
  }

  private async processJob(
    job: Job<ScrapeJobData>,
    scrapeFunction: () => Promise<void>,
  ) {
    const { jobId } = job.data;

    try {
      await this.scrapeService.updateJobStatus(jobId, ScrapeJobStatus.PROCESSING);
      await scrapeFunction();
      await this.scrapeService.updateJobStatus(jobId, ScrapeJobStatus.COMPLETED);
      this.logger.log(`Completed scrape job ${jobId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed scrape job ${jobId}: ${errorMessage}`);
      await this.scrapeService.incrementRetryCount(jobId);
      throw error; // Re-throw to trigger Bull's retry mechanism
    }
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error(`Queue error: ${error.message}`, error.stack);
  }

  @OnQueueFailed()
  async onFailed(job: Job<ScrapeJobData>, error: Error) {
    const { jobId } = job.data;
    this.logger.error(`Job ${jobId} failed after retries: ${error.message}`);
    await this.scrapeService.updateJobStatus(
      jobId,
      ScrapeJobStatus.FAILED,
      error.message,
    );
  }
}

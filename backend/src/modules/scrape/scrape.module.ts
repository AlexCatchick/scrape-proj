import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScrapeService } from './scrape.service';
import { ScrapeController } from './scrape.controller';
import { ScrapeProcessor } from './scrape.processor';
import { NavigationScraper } from './scrapers/navigation.scraper';
import { CategoryScraper } from './scrapers/category.scraper';
import { ProductListScraper } from './scrapers/product-list.scraper';
import { ProductDetailScraper } from './scrapers/product-detail.scraper';
import {
  Navigation,
  Category,
  Product,
  ProductDetail,
  Review,
  ScrapeJob,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Navigation,
      Category,
      Product,
      ProductDetail,
      Review,
      ScrapeJob,
    ]),
    BullModule.registerQueue({
      name: 'scrape',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  controllers: [ScrapeController],
  providers: [
    ScrapeService,
    ScrapeProcessor,
    NavigationScraper,
    CategoryScraper,
    ProductListScraper,
    ProductDetailScraper,
  ],
  exports: [ScrapeService],
})
export class ScrapeModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductDetail, Review, Category } from '../../database/entities';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductDetail, Review, Category]),
    ScrapeModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

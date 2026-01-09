import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation, Category } from '../../database/entities';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Navigation, Category]),
    ScrapeModule,
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}

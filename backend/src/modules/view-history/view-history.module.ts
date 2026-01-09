import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewHistoryService } from './view-history.service';
import { ViewHistoryController } from './view-history.controller';
import { ViewHistory } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ViewHistory])],
  controllers: [ViewHistoryController],
  providers: [ViewHistoryService],
  exports: [ViewHistoryService],
})
export class ViewHistoryModule {}

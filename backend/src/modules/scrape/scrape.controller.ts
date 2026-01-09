import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScrapeService } from './scrape.service';
import { TriggerScrapeDto, ScrapeJobResponseDto } from './dto';
import { ScrapeJobTargetType } from '../../database/entities';

@ApiTags('scrape')
@Controller('scrape')
export class ScrapeController {
  constructor(private readonly scrapeService: ScrapeService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger a new scrape job' })
  @ApiResponse({
    status: 202,
    description: 'Scrape job has been queued',
    type: ScrapeJobResponseDto,
  })
  async triggerScrape(@Body() dto: TriggerScrapeDto): Promise<ScrapeJobResponseDto> {
    const job = await this.scrapeService.enqueueScrapeJob(
      dto.targetUrl,
      dto.targetType as ScrapeJobTargetType,
      dto.referenceId,
      dto.forceRefresh,
    );

    return {
      jobId: job.id,
      status: job.status,
      targetUrl: job.targetUrl,
      targetType: job.targetType,
      message: 'Scrape job has been queued',
    };
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get recent scrape jobs' })
  @ApiResponse({
    status: 200,
    description: 'List of recent scrape jobs',
  })
  async getRecentJobs() {
    return this.scrapeService.getRecentJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get scrape job status' })
  @ApiResponse({
    status: 200,
    description: 'Scrape job details',
    type: ScrapeJobResponseDto,
  })
  async getJobStatus(@Param('id') id: string): Promise<ScrapeJobResponseDto | null> {
    const job = await this.scrapeService.getJobStatus(id);
    
    if (!job) {
      return null;
    }

    return {
      jobId: job.id,
      status: job.status,
      targetUrl: job.targetUrl,
      targetType: job.targetType,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      errorLog: job.errorLog,
    };
  }

  @Post('navigation')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger navigation scrape' })
  async triggerNavigationScrape() {
    const job = await this.scrapeService.enqueueScrapeJob(
      'https://www.worldofbooks.com/',
      ScrapeJobTargetType.NAVIGATION,
    );

    return {
      jobId: job.id,
      status: job.status,
      message: 'Navigation scrape job has been queued',
    };
  }
}

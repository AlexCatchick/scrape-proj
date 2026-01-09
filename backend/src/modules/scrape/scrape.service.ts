import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { ScrapeJob, ScrapeJobStatus, ScrapeJobTargetType } from '../../database/entities';

export interface ScrapeJobData {
  jobId: string;
  targetUrl: string;
  targetType: ScrapeJobTargetType;
  referenceId?: string;
  forceRefresh?: boolean;
}

@Injectable()
export class ScrapeService {
  private readonly logger = new Logger(ScrapeService.name);
  private readonly cacheTtlMinutes: number;

  constructor(
    @InjectRepository(ScrapeJob)
    private scrapeJobRepository: Repository<ScrapeJob>,
    @InjectQueue('scrape')
    private scrapeQueue: Queue<ScrapeJobData>,
    private configService: ConfigService,
  ) {
    this.cacheTtlMinutes = this.configService.get<number>('SCRAPE_CACHE_TTL_MINUTES', 60);
  }

  async enqueueScrapeJob(
    targetUrl: string,
    targetType: ScrapeJobTargetType,
    referenceId?: string,
    forceRefresh = false,
  ): Promise<ScrapeJob> {
    // Check for existing pending/processing job
    const existingJob = await this.scrapeJobRepository.findOne({
      where: {
        targetUrl,
        status: ScrapeJobStatus.PENDING,
      },
    });

    if (existingJob && !forceRefresh) {
      this.logger.debug(`Job already exists for ${targetUrl}`);
      return existingJob;
    }

    // Create new job record
    const scrapeJob = this.scrapeJobRepository.create({
      targetUrl,
      targetType,
      referenceId,
      status: ScrapeJobStatus.PENDING,
    });

    await this.scrapeJobRepository.save(scrapeJob);

    // Add to Bull queue
    await this.scrapeQueue.add(
      targetType,
      {
        jobId: scrapeJob.id,
        targetUrl,
        targetType,
        referenceId,
        forceRefresh,
      },
      {
        jobId: scrapeJob.id,
        delay: this.configService.get<number>('SCRAPE_RATE_LIMIT_DELAY_MS', 2000),
      },
    );

    this.logger.log(`Enqueued scrape job ${scrapeJob.id} for ${targetUrl}`);
    return scrapeJob;
  }

  async getJobStatus(jobId: string): Promise<ScrapeJob | null> {
    return this.scrapeJobRepository.findOne({
      where: { id: jobId },
    });
  }

  async updateJobStatus(
    jobId: string,
    status: ScrapeJobStatus,
    errorLog?: string,
  ): Promise<void> {
    const updateData: Partial<ScrapeJob> = { status };

    if (status === ScrapeJobStatus.PROCESSING) {
      updateData.startedAt = new Date();
    }

    if (status === ScrapeJobStatus.COMPLETED || status === ScrapeJobStatus.FAILED) {
      updateData.finishedAt = new Date();
    }

    if (errorLog) {
      updateData.errorLog = errorLog;
    }

    await this.scrapeJobRepository.update(jobId, updateData);
  }

  async incrementRetryCount(jobId: string): Promise<void> {
    await this.scrapeJobRepository.increment({ id: jobId }, 'retryCount', 1);
  }

  isCacheExpired(lastScrapedAt: Date | null): boolean {
    if (!lastScrapedAt) return true;
    
    const expiryTime = new Date(lastScrapedAt.getTime() + this.cacheTtlMinutes * 60 * 1000);
    return new Date() > expiryTime;
  }

  async getPendingJobs(): Promise<ScrapeJob[]> {
    return this.scrapeJobRepository.find({
      where: { status: ScrapeJobStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  async getRecentJobs(limit = 50): Promise<ScrapeJob[]> {
    return this.scrapeJobRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

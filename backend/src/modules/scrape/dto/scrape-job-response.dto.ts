import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScrapeJobStatus, ScrapeJobTargetType } from '../../../database/entities';

export class ScrapeJobResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty({ enum: ScrapeJobStatus })
  status: ScrapeJobStatus;

  @ApiProperty()
  targetUrl: string;

  @ApiProperty({ enum: ScrapeJobTargetType })
  targetType: ScrapeJobTargetType;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  startedAt?: Date | null;

  @ApiPropertyOptional()
  finishedAt?: Date | null;

  @ApiPropertyOptional()
  errorLog?: string | null;
}

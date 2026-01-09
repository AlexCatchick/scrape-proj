import { IsString, IsEnum, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScrapeJobTargetType } from '../../../database/entities';

export class TriggerScrapeDto {
  @ApiProperty({
    description: 'Target URL to scrape',
    example: 'https://www.worldofbooks.com/en-gb/category/fiction',
  })
  @IsUrl()
  targetUrl: string;

  @ApiProperty({
    description: 'Type of scrape target',
    enum: ScrapeJobTargetType,
    example: ScrapeJobTargetType.CATEGORY,
  })
  @IsEnum(ScrapeJobTargetType)
  targetType: ScrapeJobTargetType;

  @ApiPropertyOptional({
    description: 'Reference ID (category or product ID)',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({
    description: 'Force refresh even if cache is valid',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}

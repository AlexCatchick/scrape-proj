import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCategoriesDto {
  @ApiPropertyOptional({ description: 'Filter by navigation ID' })
  @IsOptional()
  @IsString()
  navigationId?: string;

  @ApiPropertyOptional({ description: 'Filter by parent category ID' })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class TriggerCategoryScrapeDto {
  @ApiPropertyOptional({ description: 'Source URL to scrape' })
  @IsString()
  sourceUrl: string;

  @ApiPropertyOptional({ description: 'Navigation ID reference' })
  @IsOptional()
  @IsString()
  navigationId?: string;
}

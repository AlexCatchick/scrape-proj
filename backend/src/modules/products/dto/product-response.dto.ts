import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sourceId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  author?: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiPropertyOptional()
  originalPrice?: number;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiProperty()
  sourceUrl: string;

  @ApiPropertyOptional()
  condition?: string | null;

  @ApiProperty()
  inStock: boolean;

  @ApiPropertyOptional()
  lastScrapedAt?: Date | null;
}

export class ReviewDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  author?: string | null;

  @ApiProperty()
  rating: number;

  @ApiPropertyOptional()
  text?: string | null;

  @ApiPropertyOptional()
  title?: string | null;

  @ApiPropertyOptional()
  reviewDate?: string | null;
}

export class CategorySummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;
}

export class ProductDetailResponseDto extends ProductResponseDto {
  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional()
  isbn?: string | null;

  @ApiPropertyOptional()
  publisher?: string | null;

  @ApiPropertyOptional()
  publicationDate?: string | null;

  @ApiPropertyOptional()
  format?: string | null;

  @ApiPropertyOptional()
  language?: string | null;

  @ApiPropertyOptional()
  pages?: number | null;

  @ApiPropertyOptional({ type: Object })
  specs?: Record<string, any> | null;

  @ApiPropertyOptional()
  ratingsAvg?: number | null;

  @ApiProperty()
  reviewsCount: number;

  @ApiPropertyOptional({ type: [ReviewDto] })
  reviews?: ReviewDto[];

  @ApiPropertyOptional({ type: CategorySummaryDto })
  category?: CategorySummaryDto;
}

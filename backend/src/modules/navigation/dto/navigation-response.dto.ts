import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NavigationCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;
}

export class NavigationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  sourceUrl: string;

  @ApiPropertyOptional()
  lastScrapedAt: Date | null;

  @ApiPropertyOptional({ type: [NavigationCategoryDto] })
  categories?: NavigationCategoryDto[];
}

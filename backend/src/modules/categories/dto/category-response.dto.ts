import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryChildDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  productCount?: number | null;
}

export class CategoryNavigationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;
}

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  sourceUrl: string;

  @ApiPropertyOptional()
  productCount?: number | null;

  @ApiPropertyOptional()
  imageUrl?: string | null;

  @ApiPropertyOptional()
  lastScrapedAt?: Date | null;

  @ApiPropertyOptional()
  navigationId?: string | null;

  @ApiPropertyOptional()
  parentId?: string | null;

  @ApiPropertyOptional({ type: [CategoryChildDto] })
  children?: CategoryChildDto[];

  @ApiPropertyOptional({ type: CategoryNavigationDto })
  navigation?: CategoryNavigationDto;

  @ApiPropertyOptional({ type: CategoryChildDto })
  parent?: CategoryChildDto;
}

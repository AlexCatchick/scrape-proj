import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { QueryCategoriesDto, CategoryResponseDto, TriggerCategoryScrapeDto } from './dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
  })
  async findAll(@Query() query: QueryCategoriesDto) {
    const { data, total } = await this.categoriesService.findAll(query);

    return {
      data: data.map((cat) => this.mapToDto(cat)),
      total,
      page: query.page || 1,
      limit: query.limit || 50,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findOne(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.mapToDto(category);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findBySlug(slug);

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return this.mapToDto(category);
  }

  @Get(':id/breadcrumbs')
  @ApiOperation({ summary: 'Get category breadcrumbs' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getBreadcrumbs(@Param('id') id: string) {
    const breadcrumbs = await this.categoriesService.getBreadcrumbs(id);
    return breadcrumbs.map((cat) => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
    }));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger category refresh scrape' })
  @ApiResponse({
    status: 202,
    description: 'Scrape job has been queued',
  })
  async triggerRefresh(@Body() dto: TriggerCategoryScrapeDto) {
    await this.categoriesService.triggerScrape(dto.sourceUrl, dto.navigationId);
    return { message: 'Category refresh has been queued' };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync categories from navigation data' })
  @ApiResponse({
    status: 200,
    description: 'Categories synced from navigation',
  })
  async syncFromNavigation() {
    const result = await this.categoriesService.syncFromNavigation();
    return { 
      message: `Synced ${result.synced} new categories from ${result.total} navigation items`,
      ...result,
    };
  }

  private mapToDto(category: any): CategoryResponseDto {
    return {
      id: category.id,
      title: category.title,
      slug: category.slug,
      sourceUrl: category.sourceUrl,
      productCount: category.productCount,
      imageUrl: category.imageUrl,
      lastScrapedAt: category.lastScrapedAt,
      navigationId: category.navigationId,
      parentId: category.parentId,
      children: category.children?.map((child: any) => ({
        id: child.id,
        title: child.title,
        slug: child.slug,
        productCount: child.productCount,
      })),
      navigation: category.navigation
        ? {
            id: category.navigation.id,
            title: category.navigation.title,
            slug: category.navigation.slug,
          }
        : undefined,
      parent: category.parent
        ? {
            id: category.parent.id,
            title: category.parent.title,
            slug: category.parent.slug,
          }
        : undefined,
    };
  }
}

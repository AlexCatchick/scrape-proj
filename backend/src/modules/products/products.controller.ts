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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  QueryProductsDto,
  ProductResponseDto,
  ProductDetailResponseDto,
  TriggerProductScrapeDto,
} from './dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get products with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
  })
  async findAll(@Query() query: QueryProductsDto) {
    const result = await this.productsService.findAll(query);

    return {
      data: result.data.map((product) => this.mapToDto(product)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID with full details' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product with full details',
    type: ProductDetailResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ProductDetailResponseDto> {
    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapToDetailDto(product);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async getReviews(@Param('id') id: string) {
    const reviews = await this.productsService.getProductReviews(id);
    return reviews.map((review) => ({
      id: review.id,
      author: review.author,
      rating: review.rating,
      text: review.text,
      title: review.title,
      reviewDate: review.reviewDate,
      createdAt: review.createdAt,
    }));
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async getRelated(@Param('id') id: string) {
    const products = await this.productsService.getRelatedProducts(id);
    return products.map((product) => this.mapToDto(product));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger product list scrape' })
  @ApiResponse({
    status: 202,
    description: 'Scrape job has been queued',
  })
  async triggerRefresh(@Body() dto: TriggerProductScrapeDto) {
    await this.productsService.triggerListScrape(dto.sourceUrl, dto.categoryId);
    return { message: 'Product list refresh has been queued' };
  }

  @Post(':id/refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger product detail scrape' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async triggerDetailRefresh(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productsService.triggerDetailScrape(id, product.sourceUrl);
    return { message: 'Product detail refresh has been queued' };
  }

  private mapToDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      sourceId: product.sourceId,
      title: product.title,
      author: product.author,
      price: parseFloat(product.price),
      currency: product.currency,
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
      imageUrl: product.imageUrl,
      sourceUrl: product.sourceUrl,
      condition: product.condition,
      inStock: product.inStock,
      lastScrapedAt: product.lastScrapedAt,
    };
  }

  private mapToDetailDto(product: any): ProductDetailResponseDto {
    const dto: ProductDetailResponseDto = {
      ...this.mapToDto(product),
      description: product.detail?.description,
      isbn: product.detail?.isbn,
      publisher: product.detail?.publisher,
      publicationDate: product.detail?.publicationDate,
      format: product.detail?.format,
      language: product.detail?.language,
      pages: product.detail?.pages,
      specs: product.detail?.specs,
      ratingsAvg: product.detail?.ratingsAvg ? parseFloat(product.detail.ratingsAvg) : undefined,
      reviewsCount: product.detail?.reviewsCount || 0,
      reviews: product.reviews?.map((review: any) => ({
        id: review.id,
        author: review.author,
        rating: review.rating,
        text: review.text,
        title: review.title,
        reviewDate: review.reviewDate,
      })),
      category: product.category
        ? {
            id: product.category.id,
            title: product.category.title,
            slug: product.category.slug,
          }
        : undefined,
    };

    return dto;
  }
}

import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { NavigationResponseDto } from './dto';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation items' })
  @ApiResponse({
    status: 200,
    description: 'List of navigation items',
    type: [NavigationResponseDto],
  })
  async findAll(): Promise<NavigationResponseDto[]> {
    const navigations = await this.navigationService.findAll();
    return navigations.map((nav) => ({
      id: nav.id,
      title: nav.title,
      slug: nav.slug,
      sourceUrl: nav.sourceUrl,
      lastScrapedAt: nav.lastScrapedAt,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get navigation by ID' })
  @ApiParam({ name: 'id', description: 'Navigation ID' })
  @ApiResponse({
    status: 200,
    description: 'Navigation item details',
    type: NavigationResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<NavigationResponseDto> {
    const navigation = await this.navigationService.findOne(id);
    
    if (!navigation) {
      throw new NotFoundException(`Navigation with ID ${id} not found`);
    }

    return {
      id: navigation.id,
      title: navigation.title,
      slug: navigation.slug,
      sourceUrl: navigation.sourceUrl,
      lastScrapedAt: navigation.lastScrapedAt,
      categories: navigation.categories?.map((cat) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
      })),
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get navigation by slug' })
  @ApiParam({ name: 'slug', description: 'Navigation slug' })
  async findBySlug(@Param('slug') slug: string): Promise<NavigationResponseDto> {
    const navigation = await this.navigationService.findBySlug(slug);
    
    if (!navigation) {
      throw new NotFoundException(`Navigation with slug ${slug} not found`);
    }

    return {
      id: navigation.id,
      title: navigation.title,
      slug: navigation.slug,
      sourceUrl: navigation.sourceUrl,
      lastScrapedAt: navigation.lastScrapedAt,
      categories: navigation.categories?.map((cat) => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
      })),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger navigation refresh scrape' })
  @ApiResponse({
    status: 202,
    description: 'Scrape job has been queued',
  })
  async triggerRefresh() {
    await this.navigationService.triggerScrape();
    return { message: 'Navigation refresh has been queued' };
  }
}

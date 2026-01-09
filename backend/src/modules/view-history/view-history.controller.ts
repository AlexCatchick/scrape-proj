import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ViewHistoryService } from './view-history.service';
import { CreateViewHistoryDto, ViewHistoryResponseDto } from './dto';

@ApiTags('view-history')
@Controller('view-history')
export class ViewHistoryController {
  constructor(private readonly viewHistoryService: ViewHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a view history entry' })
  async create(@Body() dto: CreateViewHistoryDto): Promise<ViewHistoryResponseDto> {
    const viewHistory = await this.viewHistoryService.create(dto);
    return this.mapToDto(viewHistory);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: 'Get view history by session ID' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async findBySession(@Param('sessionId') sessionId: string): Promise<ViewHistoryResponseDto[]> {
    const history = await this.viewHistoryService.findBySession(sessionId);
    return history.map((item) => this.mapToDto(item));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get view history by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUser(@Param('userId') userId: string): Promise<ViewHistoryResponseDto[]> {
    const history = await this.viewHistoryService.findByUser(userId);
    return history.map((item) => this.mapToDto(item));
  }

  @Delete('session/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear view history for a session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  async clearSession(@Param('sessionId') sessionId: string): Promise<void> {
    await this.viewHistoryService.clearSession(sessionId);
  }

  private mapToDto(viewHistory: any): ViewHistoryResponseDto {
    return {
      id: viewHistory.id,
      sessionId: viewHistory.sessionId,
      userId: viewHistory.userId,
      entityType: viewHistory.entityType,
      entityId: viewHistory.entityId,
      path: viewHistory.path,
      pathJson: viewHistory.pathJson,
      createdAt: viewHistory.createdAt,
    };
  }
}

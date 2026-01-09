import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewHistory } from '../../database/entities';
import { CreateViewHistoryDto } from './dto';

@Injectable()
export class ViewHistoryService {
  private readonly logger = new Logger(ViewHistoryService.name);

  constructor(
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
  ) {}

  async create(dto: CreateViewHistoryDto): Promise<ViewHistory> {
    const viewHistory = this.viewHistoryRepository.create({
      sessionId: dto.sessionId,
      userId: dto.userId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      path: dto.path,
      pathJson: dto.pathJson,
    });

    return this.viewHistoryRepository.save(viewHistory);
  }

  async findBySession(sessionId: string): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findByUser(userId: string): Promise<ViewHistory[]> {
    return this.viewHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.viewHistoryRepository.delete({ sessionId });
    this.logger.log(`Cleared view history for session ${sessionId}`);
  }
}

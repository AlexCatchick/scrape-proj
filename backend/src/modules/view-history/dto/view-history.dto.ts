import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateViewHistoryDto {
  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'User ID (if authenticated)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Type of entity viewed (navigation, category, product)' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'ID of the entity viewed' })
  @IsUUID()
  entityId: string;

  @ApiPropertyOptional({ description: 'Current path/URL' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'JSON representation of the path' })
  @IsOptional()
  @IsObject()
  pathJson?: Record<string, any>;
}

export class ViewHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sessionId: string;

  @ApiPropertyOptional()
  userId?: string | null;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  entityId: string;

  @ApiPropertyOptional()
  path?: string | null;

  @ApiPropertyOptional()
  pathJson?: Record<string, any> | null;

  @ApiProperty()
  createdAt: Date;
}

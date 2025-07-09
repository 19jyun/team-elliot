import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Role } from '@prisma/client';

export enum LogLevel {
  CRITICAL = 'CRITICAL',
  IMPORTANT = 'IMPORTANT',
  NORMAL = 'NORMAL',
  DEBUG = 'DEBUG',
}

export class CreateActivityLogDto {
  @IsNumber()
  userId: number;

  @IsEnum(Role)
  userRole: Role;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsNumber()
  entityId?: number;

  @IsOptional()
  @IsObject()
  oldValue?: any;

  @IsOptional()
  @IsObject()
  newValue?: any;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

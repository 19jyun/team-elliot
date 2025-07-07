import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';

export enum LogLevel {
  CRITICAL = 'CRITICAL',
  IMPORTANT = 'IMPORTANT',
  NORMAL = 'NORMAL',
  DEBUG = 'DEBUG',
}

export class QueryActivityLogDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  userId?: number;

  @IsOptional()
  @IsEnum(Role)
  userRole?: Role;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  entityId?: number;

  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}

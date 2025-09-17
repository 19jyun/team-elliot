import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: '페이지 번호',
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: '페이지당 항목 수',
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: '현재 페이지' })
  page: number;

  @ApiProperty({ example: 10, description: '페이지당 항목 수' })
  limit: number;

  @ApiProperty({ example: 100, description: '전체 항목 수' })
  total: number;

  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  totalPages: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  @ApiProperty({ example: false, description: '이전 페이지 존재 여부' })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ example: true, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터' })
  data: T[];

  @ApiProperty({ description: '페이지네이션 메타 정보' })
  meta: PaginationMetaDto;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '응답 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/students', description: '요청 경로' })
  path: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: '기초 발레 수업', description: '수업 이름' })
  @IsString()
  className: string;

  @ApiPropertyOptional({
    example: '초보자를 위한 수업입니다.',
    description: '수업 설명 (선택)',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 20, description: '최대 수강 인원 (선택)' })
  @IsNumber()
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({ example: 100000, description: '수강료' })
  @IsNumber()
  tuitionFee: number;

  @ApiProperty({ example: 1, description: '담당 선생님 ID' })
  @IsNumber()
  teacherId: number;

  @ApiProperty({ example: '월', description: '수업 요일' })
  @IsString()
  dayOfWeek: string;

  @ApiProperty({ example: '14:00', description: '수업 시작 시간 (HH:mm)' })
  @IsString()
  time: string;

  @ApiProperty({
    example: '2024-07-01',
    description: '수업 시작일 (YYYY-MM-DD)',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    example: '2024-08-31',
    description: '수업 종료일 (YYYY-MM-DD)',
  })
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({
    example: 'BEGINNER',
    description: '수업 난이도 (선택)',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    example: '#F8F9FA',
    description: '배경색 코드 (선택)',
  })
  @IsString()
  @IsOptional()
  backgroundColor?: string;
}

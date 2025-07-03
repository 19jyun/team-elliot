import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @ApiProperty({ example: '기초 발레 수업', description: '수업 이름' })
  @IsString()
  @IsNotEmpty()
  className: string;

  @ApiProperty({
    example: '초보자를 위한 수업입니다.',
    description: '수업 설명',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 20, description: '최대 수강 인원' })
  @IsNumber()
  maxStudents: number;

  @ApiProperty({ example: 100000, description: '수강료' })
  @IsNumber()
  tuitionFee: number;

  @ApiProperty({ example: 1, description: '담당 선생님 ID' })
  @IsNumber()
  teacherId: number;

  @ApiProperty({
    example: 'MONDAY',
    description:
      '수업 요일 (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY)',
  })
  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @ApiProperty({
    example: 'BEGINNER',
    description: '수업 난이도 (BEGINNER, INTERMEDIATE, ADVANCED)',
  })
  @IsString()
  @IsNotEmpty()
  level: string;

  @ApiProperty({
    example: '2024-07-01T00:00:00.000Z',
    description: '수업 시작일 (UTC ISO 문자열)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2024-09-01T23:59:59.999Z',
    description: '수업 종료일 (UTC ISO 문자열)',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: '19:00',
    description: '수업 시작 시간 (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    example: '20:30',
    description: '수업 종료 시간 (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({
    example: '#F8F9FA',
    description: '배경색 코드 (선택)',
  })
  @IsString()
  @IsOptional()
  backgroundColor?: string;
}

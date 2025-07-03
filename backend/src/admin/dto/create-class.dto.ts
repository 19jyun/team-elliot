import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
    example: '2024-07-01',
    description: '수업 시작일 (YYYY-MM-DD)',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    example: '2024-09-01',
    description: '수업 종료일 (YYYY-MM-DD)',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    example: '19:00',
    description: '수업 시작 시간 (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    // HH:mm 형식 검증
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      throw new Error('startTime must be in HH:mm format');
    }
    return value;
  })
  startTime: string;

  @ApiProperty({
    example: '20:30',
    description: '수업 종료 시간 (HH:mm)',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    // HH:mm 형식 검증
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      throw new Error('endTime must be in HH:mm format');
    }
    return value;
  })
  endTime: string;

  @ApiPropertyOptional({
    example: '#F8F9FA',
    description: '배경색 코드 (선택)',
  })
  @IsString()
  @IsOptional()
  backgroundColor?: string;
}

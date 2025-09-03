import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: '김강사',
    description: '강사 이름 (한글, 영문, 공백만 사용 가능, 2-50자)',
    minLength: 2,
    maxLength: 50,
    pattern: '^[가-힣a-zA-Z\\s]+$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '이름은 한글, 영문, 공백만 사용 가능합니다.',
  })
  name?: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '휴대폰 번호 (01X-XXXX-XXXX 형식)',
    pattern: '^01[0-9]-[0-9]{4}-[0-9]{4}$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, {
    message: '전화번호는 01X-XXXX-XXXX 형식이어야 합니다.',
  })
  phoneNumber?: string;

  @ApiProperty({
    example:
      '발레 전문 강사로서 10년간의 경험을 가지고 있습니다. 기초부터 고급까지 체계적인 커리큘럼으로 수업을 진행합니다.',
    description: '강사 소개글 (최대 1000자)',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '소개는 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '소개는 1000자 이하여야 합니다.' })
  introduction?: string;

  @ApiProperty({
    example: ['서울예술대학교 발레과 졸업', '러시아 발라쇼바 발레학교 수료'],
    description: '학력 정보 배열 (각 항목 최대 200자)',
    type: [String],
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '학력은 배열이어야 합니다.' })
  @IsString({ each: true, message: '학력 항목은 모두 문자열이어야 합니다.' })
  @MaxLength(200, {
    each: true,
    message: '각 학력 항목은 200자 이하여야 합니다.',
  })
  education?: string[];

  @ApiProperty({
    example: ['발레 기초', '발레 중급', '발레 고급', '현대무용'],
    description: '전문분야 배열 (각 항목 최대 100자)',
    type: [String],
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '전문분야는 배열이어야 합니다.' })
  @IsString({
    each: true,
    message: '전문분야 항목은 모두 문자열이어야 합니다.',
  })
  @MaxLength(100, {
    each: true,
    message: '각 전문분야 항목은 100자 이하여야 합니다.',
  })
  specialties?: string[];

  @ApiProperty({
    example: [
      '발레 지도사 자격증',
      '현대무용 지도사 자격증',
      '체조 지도사 자격증',
    ],
    description: '자격증 배열 (각 항목 최대 200자)',
    type: [String],
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '자격증은 배열이어야 합니다.' })
  @IsString({ each: true, message: '자격증 항목은 모두 문자열이어야 합니다.' })
  @MaxLength(200, {
    each: true,
    message: '각 자격증 항목은 200자 이하여야 합니다.',
  })
  certifications?: string[];

  @ApiProperty({
    example: 10,
    description: '강사 경력 년수',
    type: 'integer',
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '경력년수는 숫자여야 합니다.' })
  yearsOfExperience?: number;

  @ApiProperty({
    example: ['월요일 18:00-20:00', '수요일 18:00-20:00', '금요일 18:00-20:00'],
    description: '가능한 수업 시간 배열',
    type: [String],
    required: false,
  })
  @IsOptional()
  availableTimes?: any;
}

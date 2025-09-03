import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: '이름 (한글, 영문, 공백만 사용 가능, 2-50자)',
    example: '김원장',
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: '^[가-힣a-zA-Z\\s]+$',
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
    description: '전화번호 (01X-XXXX-XXXX 형식)',
    example: '010-1234-5678',
    required: false,
    pattern: '^01[0-9]-[0-9]{4}-[0-9]{4}$',
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, {
    message: '전화번호는 01X-XXXX-XXXX 형식이어야 합니다.',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: '소개 (1000자 이하)',
    example: '발레 교육에 열정을 가진 원장입니다.',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: '소개는 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '소개는 1000자 이하여야 합니다.' })
  introduction?: string;

  @ApiProperty({
    description: '학력 (각 항목은 200자 이하)',
    example: ['서울예술대학교 무용과 졸업'],
    required: false,
    type: [String],
    maxLength: 200,
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
    description: '자격증 (각 항목은 200자 이하)',
    example: ['발레 지도사 자격증'],
    required: false,
    type: [String],
    maxLength: 200,
  })
  @IsOptional()
  @IsArray({ message: '자격증은 배열이어야 합니다.' })
  @IsString({ each: true, message: '자격증 항목은 모두 문자열이어야 합니다.' })
  @MaxLength(200, {
    each: true,
    message: '각 자격증 항목은 200자 이하여야 합니다.',
  })
  certifications?: string[];

  // 은행 정보 필드
  @ApiProperty({
    description: '은행명 (한글, 영문, 공백만 사용 가능, 50자 이하)',
    example: '신한은행',
    required: false,
    maxLength: 50,
    pattern: '^[가-힣a-zA-Z\\s]+$',
  })
  @IsOptional()
  @IsString({ message: '은행명은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '은행명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '은행명은 한글, 영문, 공백만 사용 가능합니다.',
  })
  bankName?: string;

  @ApiProperty({
    description: '계좌번호 (숫자와 하이픈만 사용 가능, 20자 이하)',
    example: '110-123456789',
    required: false,
    maxLength: 20,
    pattern: '^[0-9-]+$',
  })
  @IsOptional()
  @IsString({ message: '계좌번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '계좌번호는 20자 이하여야 합니다.' })
  @Matches(/^[0-9-]+$/, {
    message: '계좌번호는 숫자와 하이픈만 사용 가능합니다.',
  })
  accountNumber?: string;

  @ApiProperty({
    description: '예금주 (한글, 영문, 공백만 사용 가능, 50자 이하)',
    example: '김원장',
    required: false,
    maxLength: 50,
    pattern: '^[가-힣a-zA-Z\\s]+$',
  })
  @IsOptional()
  @IsString({ message: '예금주는 문자열이어야 합니다.' })
  @MaxLength(50, { message: '예금주는 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '예금주는 한글, 영문, 공백만 사용 가능합니다.',
  })
  accountHolder?: string;
}

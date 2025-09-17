import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
    required: false,
    minLength: 2,
    maxLength: 50,
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
    description: '전화번호',
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
    example: '010-9876-5432',
    description: '비상연락처',
    required: false,
    pattern: '^01[0-9]-[0-9]{4}-[0-9]{4}$',
  })
  @IsOptional()
  @IsString({ message: '비상연락처는 문자열이어야 합니다.' })
  @Matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, {
    message: '비상연락처는 01X-XXXX-XXXX 형식이어야 합니다.',
  })
  emergencyContact?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: '생년월일',
    required: false,
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: '생년월일은 유효한 날짜 형식이어야 합니다.' })
  birthDate?: string;

  @ApiProperty({
    example: '특이사항 없음',
    description: '노트',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '노트는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '노트는 500자 이하여야 합니다.' })
  notes?: string;

  @ApiProperty({
    example: '초급',
    description: '레벨',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: '레벨은 문자열이어야 합니다.' })
  @MaxLength(20, { message: '레벨은 20자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '레벨은 한글, 영문, 공백만 사용 가능합니다.',
  })
  level?: string;
}

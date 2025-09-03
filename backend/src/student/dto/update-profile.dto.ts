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
    example: '김학생',
    description: '학생 이름 (한글, 영문, 공백만 사용 가능, 2-50자)',
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
    example: '010-2345-6789',
    description: '비상연락처 (01X-XXXX-XXXX 형식)',
    pattern: '^01[0-9]-[0-9]{4}-[0-9]{4}$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '비상연락처는 문자열이어야 합니다.' })
  @Matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, {
    message: '비상연락처는 01X-XXXX-XXXX 형식이어야 합니다.',
  })
  emergencyContact?: string;

  @ApiProperty({
    example: '2010-01-15',
    description: '생년월일 (YYYY-MM-DD 형식)',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: '생년월일은 유효한 날짜 형식이어야 합니다.' })
  birthDate?: string;

  @ApiProperty({
    example: '발레 초급자입니다. 기본 동작을 배우고 있습니다.',
    description: '학생에 대한 특이사항이나 노트 (최대 500자)',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: '노트는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '노트는 500자 이하여야 합니다.' })
  notes?: string;

  @ApiProperty({
    example: 'BEGINNER',
    description: '학생의 발레 레벨 (한글, 영문, 공백만 사용 가능, 최대 20자)',
    maxLength: 20,
    pattern: '^[가-힣a-zA-Z\\s]+$',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '레벨은 문자열이어야 합니다.' })
  @MaxLength(20, { message: '레벨은 20자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '레벨은 한글, 영문, 공백만 사용 가능합니다.',
  })
  level?: string;
}

import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAcademyDto {
  @ApiProperty({
    description: '학원명 (한글, 영문, 숫자, 공백만 사용 가능, 2-100자)',
    example: '발레 아카데미',
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: '^[가-힣a-zA-Z0-9\\s]+$',
  })
  @IsOptional()
  @IsString({ message: '학원명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '학원명은 2자 이상이어야 합니다.' })
  @MaxLength(100, { message: '학원명은 100자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '학원명은 한글, 영문, 숫자, 공백만 사용 가능합니다.',
  })
  name?: string;

  @ApiProperty({
    description:
      '전화번호 (숫자, 하이픈, 플러스, 괄호, 공백만 사용 가능, 20자 이하)',
    example: '02-1234-5678',
    required: false,
    maxLength: 20,
    pattern: '^[0-9-+\\s()]+$',
  })
  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '전화번호는 20자 이하여야 합니다.' })
  @Matches(/^[0-9-+\s()]+$/, {
    message: '전화번호는 숫자, 하이픈, 플러스, 괄호, 공백만 사용 가능합니다.',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: '주소 (200자 이하)',
    example: '서울시 강남구 테헤란로 123',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: '주소는 문자열이어야 합니다.' })
  @MaxLength(200, { message: '주소는 200자 이하여야 합니다.' })
  address?: string;

  @ApiProperty({
    description: '학원 설명 (1000자 이하)',
    example: '전문적인 발레 교육을 제공하는 아카데미입니다.',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '설명은 1000자 이하여야 합니다.' })
  description?: string;
}

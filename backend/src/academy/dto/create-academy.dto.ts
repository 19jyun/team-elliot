import {
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademyDto {
  @ApiProperty({
    example: '발레 아카데미',
    description: '학원명 (한글, 영문, 숫자, 공백만 사용 가능, 2-50자)',
    minLength: 2,
    maxLength: 50,
    pattern: '^[가-힣a-zA-Z0-9\\s]+$',
  })
  @IsString()
  @IsNotEmpty({ message: '학원명은 필수입니다.' })
  @MinLength(2, { message: '학원명은 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '학원명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '학원명은 한글, 영문, 숫자만 사용 가능합니다.',
  })
  name: string;

  @ApiProperty({
    example: '02-1234-5678',
    description: '학원 전화번호 (XX-XXXX-XXXX 또는 XXX-XXX-XXXX 형식)',
    pattern: '^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$',
  })
  @IsString()
  @IsNotEmpty({ message: '전화번호는 필수입니다.' })
  @Matches(/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '서울시 강남구 테헤란로 123',
    description: '학원 주소 (5-200자)',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: '주소는 필수입니다.' })
  @MinLength(5, { message: '주소는 5자 이상이어야 합니다.' })
  @MaxLength(200, { message: '주소는 200자 이하여야 합니다.' })
  address: string;

  @ApiProperty({
    example:
      '전문적인 발레 교육을 제공하는 학원입니다. 기초부터 고급까지 체계적인 커리큘럼으로 수업을 진행합니다.',
    description: '학원에 대한 상세 설명 (10-500자)',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: '설명은 필수입니다.' })
  @MinLength(10, { message: '설명은 10자 이상이어야 합니다.' })
  @MaxLength(500, { message: '설명은 500자 이하여야 합니다.' })
  description: string;

  @ApiProperty({
    example: 'BALLET_ACADEMY_001',
    description:
      '학원 고유 코드 (영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능, 3-20자)',
    minLength: 3,
    maxLength: 20,
    pattern: '^[A-Za-z0-9_-]+$',
  })
  @IsString()
  @IsNotEmpty({ message: '학원 코드는 필수입니다.' })
  @MinLength(3, { message: '학원 코드는 3자 이상이어야 합니다.' })
  @MaxLength(20, { message: '학원 코드는 20자 이하여야 합니다.' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message:
      '학원 코드는 영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능합니다.',
  })
  code: string;
}

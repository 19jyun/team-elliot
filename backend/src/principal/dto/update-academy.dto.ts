import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateAcademyDto {
  @IsOptional()
  @IsString({ message: '학원명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '학원명은 2자 이상이어야 합니다.' })
  @MaxLength(100, { message: '학원명은 100자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '학원명은 한글, 영문, 숫자, 공백만 사용 가능합니다.',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '전화번호는 20자 이하여야 합니다.' })
  @Matches(/^[0-9-+\s()]+$/, {
    message: '전화번호는 숫자, 하이픈, 플러스, 괄호, 공백만 사용 가능합니다.',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: '주소는 문자열이어야 합니다.' })
  @MaxLength(200, { message: '주소는 200자 이하여야 합니다.' })
  address?: string;

  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '설명은 1000자 이하여야 합니다.' })
  description?: string;
}

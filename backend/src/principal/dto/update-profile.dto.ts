import {
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @MaxLength(100, { message: '이름은 100자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '이름은 한글, 영문, 공백만 사용 가능합니다.',
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
  @IsString({ message: '소개는 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '소개는 1000자 이하여야 합니다.' })
  introduction?: string;

  @IsOptional()
  @IsArray({ message: '학력은 배열이어야 합니다.' })
  @IsString({ each: true, message: '학력 항목은 모두 문자열이어야 합니다.' })
  @MaxLength(200, {
    each: true,
    message: '각 학력 항목은 200자 이하여야 합니다.',
  })
  education?: string[];

  @IsOptional()
  @IsArray({ message: '자격증은 배열이어야 합니다.' })
  @IsString({ each: true, message: '자격증 항목은 모두 문자열이어야 합니다.' })
  @MaxLength(200, {
    each: true,
    message: '각 자격증 항목은 200자 이하여야 합니다.',
  })
  certifications?: string[];

  // 은행 정보 필드 추가
  @IsOptional()
  @IsString({ message: '은행명은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '은행명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '은행명은 한글, 영문, 공백만 사용 가능합니다.',
  })
  bankName?: string;

  @IsOptional()
  @IsString({ message: '계좌번호는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '계좌번호는 20자 이하여야 합니다.' })
  @Matches(/^[0-9-]+$/, {
    message: '계좌번호는 숫자와 하이픈만 사용 가능합니다.',
  })
  accountNumber?: string;

  @IsOptional()
  @IsString({ message: '예금주는 문자열이어야 합니다.' })
  @MaxLength(50, { message: '예금주는 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '예금주는 한글, 영문, 공백만 사용 가능합니다.',
  })
  accountHolder?: string;
}

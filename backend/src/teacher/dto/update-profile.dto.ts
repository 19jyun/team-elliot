import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '이름은 한글, 영문, 공백만 사용 가능합니다.',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @Matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, {
    message: '전화번호는 01X-XXXX-XXXX 형식이어야 합니다.',
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

  @IsOptional()
  @IsArray({ message: '자격증은 배열이어야 합니다.' })
  @IsString({ each: true, message: '자격증 항목은 모두 문자열이어야 합니다.' })
  @MaxLength(200, {
    each: true,
    message: '각 자격증 항목은 200자 이하여야 합니다.',
  })
  certifications?: string[];

  @IsOptional()
  @IsNumber({}, { message: '경력년수는 숫자여야 합니다.' })
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray({ message: '가능한 시간은 배열이어야 합니다.' })
  @IsString({
    each: true,
    message: '가능한 시간 항목은 모두 문자열이어야 합니다.',
  })
  availableTimes?: string[];
}

import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class JoinAcademyDto {
  @IsString({ message: '학원 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '학원 코드는 필수입니다.' })
  @MinLength(3, { message: '학원 코드는 3자 이상이어야 합니다.' })
  @MaxLength(20, { message: '학원 코드는 20자 이하여야 합니다.' })
  @Matches(/^[A-Z0-9]+$/, {
    message: '학원 코드는 대문자와 숫자만 사용 가능합니다.',
  })
  code: string; // 학원 고유 코드
}

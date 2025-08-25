import {
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateAcademyDto {
  @IsString()
  @IsNotEmpty({ message: '학원명은 필수입니다.' })
  @MinLength(2, { message: '학원명은 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '학원명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '학원명은 한글, 영문, 숫자만 사용 가능합니다.',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '전화번호는 필수입니다.' })
  @Matches(/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: '주소는 필수입니다.' })
  @MinLength(5, { message: '주소는 5자 이상이어야 합니다.' })
  @MaxLength(200, { message: '주소는 200자 이하여야 합니다.' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: '설명은 필수입니다.' })
  @MinLength(10, { message: '설명은 10자 이상이어야 합니다.' })
  @MaxLength(500, { message: '설명은 500자 이하여야 합니다.' })
  description: string;

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

import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateAcademyDto {
  @IsString()
  @IsNotEmpty()
  name: string; // 학원 이름

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)',
  })
  phoneNumber: string; // 학원 연락처

  @IsString()
  @IsNotEmpty()
  address: string; // 학원 주소

  @IsString()
  @IsNotEmpty()
  description: string; // 학원 설명

  @IsString()
  @IsNotEmpty()
  code: string; // 학원 고유 코드
}

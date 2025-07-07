import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateAcademyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678)',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

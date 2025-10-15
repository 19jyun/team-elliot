import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AcademyInfoDto {
  @ApiProperty({
    example: '김원장의 발레 학원',
    description: '학원명',
  })
  @IsString()
  @IsNotEmpty({ message: '학원명을 입력해주세요.' })
  name: string;

  @ApiProperty({
    example: '02-1234-5678',
    description: '학원 전화번호',
  })
  @IsString()
  @Matches(/^(0[0-9]-\d{4}-\d{4}|01[0-9]-\d{4}-\d{4})$/, {
    message:
      '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678 또는 010-1234-5678)',
  })
  phoneNumber: string;

  @ApiProperty({
    example: '서울시 강남구 테헤란로 123',
    description: '학원 주소',
  })
  @IsString()
  @IsNotEmpty({ message: '학원 주소를 입력해주세요.' })
  address: string;

  @ApiProperty({
    example: '전문적인 발레 교육을 제공하는 학원입니다.',
    description: '학원 소개',
  })
  @IsString()
  @IsNotEmpty({ message: '학원 소개를 입력해주세요.' })
  description: string;
}

export class PrincipalSignupDto {
  @ApiProperty({
    example: 'principal001',
    description: '사용자 아이디',
  })
  @IsString()
  @MinLength(8, { message: '아이디는 8자 이상이어야 합니다.' })
  @MaxLength(15, { message: '아이디는 15자 이하여야 합니다.' })
  @Matches(/^[A-Za-z0-9]+$/, {
    message: '아이디는 영문, 숫자만 사용 가능합니다.',
  })
  userId: string;

  @ApiProperty({
    example: 'securePassword123',
    description: '비밀번호',
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: '비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.',
  })
  password: string;

  @ApiProperty({
    example: '김원장',
    description: '원장 이름',
  })
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  name: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '원장 전화번호',
  })
  @IsString()
  @Matches(/^01[0-9]-\d{4}-\d{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다.',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'PRINCIPAL',
    description: '사용자 역할 (고정값)',
  })
  @IsString()
  role: 'PRINCIPAL';

  @ApiProperty({
    type: AcademyInfoDto,
    description: '학원 정보',
  })
  @ValidateNested()
  @Type(() => AcademyInfoDto)
  @IsNotEmpty({ message: '학원 정보를 입력해주세요.' })
  academyInfo: AcademyInfoDto;
}

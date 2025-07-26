import { IsString, MinLength, MaxLength, Matches, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SignupDto {
  @ApiProperty({ example: 'student001' })
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: '아이디는 영문, 숫자만 사용 가능합니다.',
  })
  userId: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: '비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.',
  })
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  @Matches(/^01[0-9]-\d{4}-\d{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다.',
  })
  phoneNumber: string;

  @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'TEACHER'] })
  @IsString()
  @IsIn(['STUDENT', 'TEACHER'])
  role: 'STUDENT' | 'TEACHER';
}

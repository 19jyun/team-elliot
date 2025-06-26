import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'student001', description: '수강생 로그인용 ID' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'securePassword123', description: '비밀번호' })
  @IsString()
  password: string;

  @ApiProperty({ example: '김수지', description: '수강생 이름' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '01012345678',
    description: '전화번호 (선택)',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

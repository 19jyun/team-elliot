import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class JoinAcademyRequestDto {
  @ApiProperty({ description: '학원 코드' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '가입 신청 메시지', required: false })
  @IsString()
  @IsOptional()
  message?: string;
}

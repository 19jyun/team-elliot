import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinAcademyDto {
  @ApiProperty({
    example: 'BALLET_ACADEMY_001',
    description: '가입할 학원의 고유 코드',
    pattern: '^[A-Za-z0-9_-]+$',
  })
  @IsString()
  @IsNotEmpty({ message: '학원 코드는 필수입니다.' })
  code: string;
}

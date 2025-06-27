import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'teacher001', description: '선생님의 로그인용 ID' })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'securePassword123',
    description: '비밀번호 (해시 처리됨)',
  })
  @IsString()
  password: string;

  @ApiProperty({ example: '이예진', description: '선생님의 이름' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: '한국예술종합학교 졸업, 유럽 무용단 활동',
    description: '자기소개 (선택)',
  })
  @IsString()
  @IsOptional()
  introduction?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: '프로필 사진 URL (선택)',
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    example: ['서울예대 졸업', '영국 로얄발레단 수료'],
    description: '학력 배열 (선택)',
  })
  @IsArray()
  @IsOptional()
  education?: string[];
}

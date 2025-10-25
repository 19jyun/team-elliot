import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionSummaryDto {
  @ApiProperty({
    description: '세션 요약 (최대 100자)',
    example: '오늘은 기본 자세와 스트레칭을 중심으로 수업했습니다.',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '세션 요약은 100자를 초과할 수 없습니다.' })
  sessionSummary?: string;
}

import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEnrollmentDto {
  @ApiProperty({
    description: '변경할 새로운 세션 ID',
    example: 2,
  })
  @IsNumber({}, { message: '세션 ID는 숫자여야 합니다.' })
  @Min(1, { message: '세션 ID는 1 이상이어야 합니다.' })
  newSessionId: number;

  @ApiProperty({
    description: '변경 사유 (선택사항)',
    example: '스케줄 변경으로 인한 수강 변경',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '변경 사유는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '변경 사유는 500자 이하여야 합니다.' })
  reason?: string;
}

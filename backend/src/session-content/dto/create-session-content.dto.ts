import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionContentDto {
  @ApiProperty({
    description: '발레 자세 ID (1 이상의 숫자)',
    example: 1,
    minimum: 1,
  })
  @IsNumber({}, { message: '발레 자세 ID는 숫자여야 합니다.' })
  @Min(1, { message: '발레 자세 ID는 1 이상이어야 합니다.' })
  poseId: number;

  @ApiProperty({
    description:
      '순서 (0 이상의 숫자, 지정하지 않으면 자동으로 마지막 순서에 추가됨)',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '순서는 숫자여야 합니다.' })
  @Min(0, { message: '순서는 0 이상이어야 합니다.' })
  order?: number;

  @ApiProperty({
    description: '추가 노트 (500자 이하, 선택사항)',
    example: '기본 자세 연습',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '노트는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '노트는 500자 이하여야 합니다.' })
  notes?: string;
}

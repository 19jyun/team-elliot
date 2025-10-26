import {
  IsArray,
  IsNumber,
  ArrayMinSize,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionPosesDto {
  @ApiProperty({
    description: '발레 자세 ID 배열 (순서대로, 중복 가능)',
    example: [1, 2, 3, 1],
  })
  @IsArray({ message: '발레 자세 ID는 배열이어야 합니다.' })
  @ArrayMinSize(0, {
    message: '발레 자세 ID 배열은 최소 0개 이상이어야 합니다.',
  })
  @IsNumber({}, { each: true, message: '각 발레 자세 ID는 숫자여야 합니다.' })
  poseIds: number[];

  @ApiProperty({
    description: '각 자세별 노트 배열 (선택사항)',
    example: ['첫 번째 자세 노트', '두 번째 자세 노트'],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: '노트는 배열이어야 합니다.' })
  @IsString({ each: true, message: '각 노트는 문자열이어야 합니다.' })
  @MaxLength(500, { each: true, message: '각 노트는 500자 이하여야 합니다.' })
  notes?: string[];
}

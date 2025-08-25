import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionContentDto {
  @ApiProperty({ description: '발레 자세 ID' })
  @IsNumber({}, { message: '발레 자세 ID는 숫자여야 합니다.' })
  @Min(1, { message: '발레 자세 ID는 1 이상이어야 합니다.' })
  poseId: number;

  @ApiProperty({ description: '순서', required: false })
  @IsOptional()
  @IsNumber({}, { message: '순서는 숫자여야 합니다.' })
  @Min(0, { message: '순서는 0 이상이어야 합니다.' })
  order?: number;

  @ApiProperty({ description: '추가 노트', required: false })
  @IsOptional()
  @IsString({ message: '노트는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '노트는 500자 이하여야 합니다.' })
  notes?: string;
}

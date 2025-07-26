import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionContentDto {
  @ApiProperty({ description: '발레 자세 ID' })
  @IsNumber()
  poseId: number;

  @ApiProperty({ description: '순서', required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ description: '추가 노트', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderSessionContentsDto {
  @ApiProperty({ description: '세션 내용 ID 배열 (순서대로)' })
  @IsArray()
  @IsString({ each: true })
  contentIds: string[];
}

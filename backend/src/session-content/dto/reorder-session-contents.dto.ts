import {
  IsArray,
  IsString,
  ArrayMinSize,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderSessionContentsDto {
  @ApiProperty({ description: '세션 내용 ID 배열 (순서대로)' })
  @IsArray({ message: '세션 내용 ID는 배열이어야 합니다.' })
  @ArrayMinSize(1, { message: '최소 1개 이상의 세션 내용 ID가 필요합니다.' })
  @IsString({ each: true, message: '각 세션 내용 ID는 문자열이어야 합니다.' })
  @IsNumberString(
    {},
    { each: true, message: '각 세션 내용 ID는 숫자 문자열이어야 합니다.' },
  )
  contentIds: string[];
}

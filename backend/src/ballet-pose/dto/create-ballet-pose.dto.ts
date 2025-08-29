import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PoseDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class CreateBalletPoseDto {
  @ApiProperty({ description: '발레 자세명' })
  @IsString({ message: '발레 자세명은 문자열이어야 합니다.' })
  @MinLength(2, { message: '발레 자세명은 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '발레 자세명은 50자 이하여야 합니다.' })
  @Matches(/^[가-힣a-zA-Z\s]+$/, {
    message: '발레 자세명은 한글, 영문, 공백만 사용 가능합니다.',
  })
  name: string;

  @ApiProperty({ description: '발레 자세 이미지 URL', required: false })
  @IsOptional()
  @IsString({ message: '이미지 URL은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '이미지 URL은 500자 이하여야 합니다.' })
  imageUrl?: string;

  @ApiProperty({ description: '발레 자세 설명' })
  @IsString({ message: '발레 자세 설명은 문자열이어야 합니다.' })
  @MinLength(10, { message: '발레 자세 설명은 10자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '발레 자세 설명은 1000자 이하여야 합니다.' })
  description: string;

  @ApiProperty({ description: '발레 자세 난이도', enum: PoseDifficulty })
  @IsEnum(PoseDifficulty, {
    message: '난이도는 BEGINNER, INTERMEDIATE, ADVANCED 중 하나여야 합니다.',
  })
  difficulty: PoseDifficulty;
}

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PoseDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class CreateBalletPoseDto {
  @ApiProperty({ description: '발레 자세명' })
  @IsString()
  name: string;

  @ApiProperty({ description: '발레 자세 이미지 URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: '발레 자세 설명' })
  @IsString()
  description: string;

  @ApiProperty({ description: '발레 자세 난이도', enum: PoseDifficulty })
  @IsEnum(PoseDifficulty)
  difficulty: PoseDifficulty;
}

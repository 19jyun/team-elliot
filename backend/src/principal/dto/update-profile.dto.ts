import { IsOptional, IsString, IsArray, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  // 은행 정보 필드 추가
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountHolder?: string;
}

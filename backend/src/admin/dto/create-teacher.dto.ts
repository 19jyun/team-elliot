import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  userId: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  introduction?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsArray()
  @IsOptional()
  education?: string[];
}

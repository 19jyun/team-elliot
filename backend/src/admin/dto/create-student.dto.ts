import { IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  userId: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

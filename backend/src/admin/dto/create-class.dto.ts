import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class CreateClassDto {
  @IsString()
  className: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  maxStudents?: number;

  @IsNumber()
  tuitionFee: number;

  @IsNumber()
  teacherId: number;

  @IsString()
  dayOfWeek: string;

  @IsString()
  time: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;
}

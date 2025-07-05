import { IsNumber, IsNotEmpty } from 'class-validator';

export class LeaveAcademyDto {
  @IsNumber()
  @IsNotEmpty()
  academyId: number; // 학원 ID
}

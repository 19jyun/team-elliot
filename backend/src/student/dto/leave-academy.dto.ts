import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class LeaveAcademyDto {
  @IsNumber({}, { message: '학원 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '학원 ID는 필수입니다.' })
  @Min(1, { message: '학원 ID는 1 이상이어야 합니다.' })
  academyId: number; // 학원 ID
}

import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveAcademyDto {
  @ApiProperty({
    example: 1,
    description: '탈퇴할 학원의 고유 ID',
    type: 'integer',
  })
  @IsNumber()
  @IsNotEmpty({ message: '학원 ID는 필수입니다.' })
  academyId: number;
}

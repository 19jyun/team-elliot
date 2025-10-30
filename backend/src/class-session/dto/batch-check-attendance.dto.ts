import { IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

export class AttendanceItemDto {
  @ApiProperty({
    description: '수강신청 ID',
    example: 1,
  })
  @IsNumber({}, { message: '수강신청 ID는 숫자여야 합니다.' })
  enrollmentId: number;

  @ApiProperty({
    description: '출석 상태',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
  })
  @IsEnum(AttendanceStatus, {
    message: '출석 상태는 PRESENT 또는 ABSENT여야 합니다.',
  })
  status: AttendanceStatus;
}

export class BatchCheckAttendanceDto {
  @ApiProperty({
    description: '출석 정보 배열',
    type: [AttendanceItemDto],
    example: [
      { enrollmentId: 1, status: 'PRESENT' },
      { enrollmentId: 2, status: 'ABSENT' },
    ],
  })
  @IsArray({ message: '출석 정보는 배열이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  attendances: AttendanceItemDto[];
}

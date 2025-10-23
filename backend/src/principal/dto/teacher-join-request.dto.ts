import { ApiProperty } from '@nestjs/swagger';

export class TeacherJoinRequestDto {
  @ApiProperty({ description: '가입 신청 ID' })
  id: number;

  @ApiProperty({ description: '선생님 ID' })
  teacherId: number;

  @ApiProperty({ description: '선생님 이름' })
  teacherName: string;

  @ApiProperty({ description: '선생님 전화번호' })
  teacherPhoneNumber: string;

  @ApiProperty({ description: '선생님 소개', nullable: true })
  teacherIntroduction?: string;

  @ApiProperty({ description: '선생님 프로필 사진', nullable: true })
  teacherPhotoUrl?: string;

  @ApiProperty({ description: '가입 신청 메시지', nullable: true })
  message?: string;

  @ApiProperty({ description: '가입 신청 상태' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ description: '가입 신청 일시' })
  createdAt: string;
}

export class TeacherJoinRequestsResponse {
  @ApiProperty({
    description: '가입 신청 대기 중인 선생님 목록',
    type: [TeacherJoinRequestDto],
  })
  pendingRequests: TeacherJoinRequestDto[];

  @ApiProperty({
    description: '가입된 선생님 목록',
    type: [TeacherJoinRequestDto],
  })
  joinedTeachers: TeacherJoinRequestDto[];
}

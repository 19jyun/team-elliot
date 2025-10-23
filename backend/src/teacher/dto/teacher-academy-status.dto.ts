import { ApiProperty } from '@nestjs/swagger';

export class TeacherAcademyStatusResponse {
  @ApiProperty({ description: '학원 가입 상태' })
  status: 'NOT_JOINED' | 'JOINED' | 'PENDING';

  @ApiProperty({ description: '현재 소속 학원 정보', nullable: true })
  academy?: {
    id: number;
    name: string;
    code: string;
    phoneNumber: string;
    address: string;
    description: string;
  };

  @ApiProperty({ description: '가입 신청 정보', nullable: true })
  joinRequest?: {
    id: number;
    academyId: number;
    academyName: string;
    message?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  };
}

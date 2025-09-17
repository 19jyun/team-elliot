import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseEntity {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR...',
    description: 'JWT 액세스 토큰',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR...',
    description: 'JWT 리프레시 토큰 (선택사항)',
    required: false,
  })
  refresh_token?: string;

  @ApiProperty({
    example: {
      id: 1,
      userId: 'student001',
      name: '홍길동',
      role: 'STUDENT',
    },
    description: '사용자 정보',
  })
  user: {
    id: number;
    userId: string;
    name: string;
    role: 'STUDENT' | 'TEACHER' | 'PRINCIPAL';
  };
}

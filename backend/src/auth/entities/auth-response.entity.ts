import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseEntity {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR...' })
  access_token: string;

  @ApiProperty({
    example: {
      id: 1,
      userId: 'student001',
      name: '홍길동',
      role: 'STUDENT',
    },
  })
  user: {
    id: number;
    userId: string;
    name: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
}

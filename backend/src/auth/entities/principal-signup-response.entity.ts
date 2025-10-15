import { ApiProperty } from '@nestjs/swagger';

export class AcademyInfoResponseEntity {
  @ApiProperty({
    example: 1,
    description: '학원 ID',
  })
  id: number;

  @ApiProperty({
    example: '김원장의 발레 학원',
    description: '학원명',
  })
  name: string;

  @ApiProperty({
    example: 'ACADEMY_1703123456789_abc123def_xyz45_abc',
    description: '학원 고유 코드',
  })
  code: string;
}

export class PrincipalSignupResponseEntity {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT 액세스 토큰',
  })
  access_token: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number', example: 1, description: '사용자 ID' },
      userId: {
        type: 'string',
        example: 'principal001',
        description: '사용자 아이디',
      },
      name: { type: 'string', example: '김원장', description: '사용자 이름' },
      role: {
        type: 'string',
        example: 'PRINCIPAL',
        description: '사용자 역할',
      },
    },
    description: '사용자 정보',
  })
  user: {
    id: number;
    userId: string;
    name: string;
    role: string;
  };

  @ApiProperty({
    type: AcademyInfoResponseEntity,
    description: '생성된 학원 정보',
  })
  academy: AcademyInfoResponseEntity;
}

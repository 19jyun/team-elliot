import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터' })
  data: T;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '응답 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login', description: '요청 경로' })
  path: string;
}

// 프론트엔드와 호환되는 선택적 필드를 포함한 응답 DTO
export class ApiResponseWithOptionalFieldsDto<T> {
  @ApiProperty({ example: true, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;

  @ApiProperty({ example: 200, description: 'HTTP 상태 코드', required: false })
  statusCode?: number;

  @ApiProperty({
    description: '에러 정보',
    required: false,
    example: {
      code: 'VALIDATION_ERROR',
      message: '입력값이 올바르지 않습니다.',
      details: null,
    },
  })
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '응답 시간',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/auth/login',
    description: '요청 경로',
    required: false,
  })
  path?: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: false, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 400, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'VALIDATION_ERROR',
      message: '입력값이 올바르지 않습니다.',
      details: {
        message: ['userId는 필수입니다.'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  error: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login', description: '요청 경로' })
  path: string;
}

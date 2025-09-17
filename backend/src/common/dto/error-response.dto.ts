import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({
    example: ['userId는 필수입니다.', 'password는 8자 이상이어야 합니다.'],
    description: '유효성 검사 오류 메시지 배열',
  })
  message: string[];

  @ApiProperty({ example: 'Bad Request', description: '오류 타입' })
  error: string;

  @ApiProperty({ example: 400, description: 'HTTP 상태 코드' })
  statusCode: number;
}

export class BadRequestErrorDto {
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
    details: ValidationErrorDto;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login', description: '요청 경로' })
  path: string;
}

export class UnauthorizedErrorDto {
  @ApiProperty({ example: false, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 401, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
      details: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  error: {
    code: string;
    message: string;
    details: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/student/profile', description: '요청 경로' })
  path: string;
}

export class ForbiddenErrorDto {
  @ApiProperty({ example: false, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 403, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'FORBIDDEN',
      message: '접근 권한이 없습니다.',
      details: {
        message: 'Forbidden',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  error: {
    code: string;
    message: string;
    details: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/teacher/classes', description: '요청 경로' })
  path: string;
}

export class NotFoundErrorDto {
  @ApiProperty({ example: false, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 404, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.',
      details: {
        message: 'Not Found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  error: {
    code: string;
    message: string;
    details: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/classes/999', description: '요청 경로' })
  path: string;
}

export class ConflictErrorDto {
  @ApiProperty({ example: false, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 409, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'CONFLICT',
      message: '이미 존재하는 리소스입니다.',
      details: {
        message: 'Conflict',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  error: {
    code: string;
    message: string;
    details: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/signup', description: '요청 경로' })
  path: string;
}

export class InternalServerErrorDto {
  @ApiProperty({ example: false, description: '요청 성공 여부' })
  success: boolean;

  @ApiProperty({ example: 500, description: 'HTTP 상태 코드' })
  statusCode: number;

  @ApiProperty({
    description: '에러 정보',
    example: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
      details: null,
    },
  })
  error: {
    code: string;
    message: string;
    details: any;
  };

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: '에러 발생 시간',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login', description: '요청 경로' })
  path: string;
}

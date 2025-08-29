import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: any;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        success: false,
        statusCode: status,
        error: {
          code: this.extractErrorCode(exceptionResponse),
          message: this.extractMessage(exceptionResponse),
          details: exceptionResponse,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else {
      // 알 수 없는 예외 처리
      errorResponse = {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 내부 오류가 발생했습니다.',
          details:
            process.env.NODE_ENV === 'development' ? exception : undefined,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private extractErrorCode(response: any): string {
    if (typeof response === 'object' && response.code) {
      return response.code;
    }

    // HTTP 상태 코드 기반 기본 에러 코드
    if (typeof response === 'object' && response.statusCode) {
      return this.getDefaultErrorCode(response.statusCode);
    }

    return 'UNKNOWN_ERROR';
  }

  private extractMessage(response: any): string {
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response.message) {
      return response.message;
    }

    return '알 수 없는 오류가 발생했습니다.';
  }

  private getDefaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}

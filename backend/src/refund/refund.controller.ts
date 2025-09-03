import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundRequestDto } from './dto/refund-request.dto';
// import { RefundProcessDto } from './dto/refund-process.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Refund')
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /**
   * 환불 요청 생성
   */
  @Post('request')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '환불 요청 생성',
    description:
      '학생이 특정 세션 수강 신청에 대한 환불을 요청합니다. 수업이 이미 시작된 경우 환불 요청할 수 없습니다.',
    operationId: 'createRefundRequest',
  })
  @ApiBody({
    type: RefundRequestDto,
    description: '환불 요청 정보',
    examples: {
      personalSchedule: {
        summary: '개인 일정 변경으로 인한 환불',
        value: {
          sessionEnrollmentId: 1,
          reason: 'PERSONAL_SCHEDULE',
          detailedReason: '개인 일정 변경으로 인해 수업 참여가 어려워졌습니다.',
          refundAmount: 50000,
          bankName: '신한은행',
          accountNumber: '110-123456789',
          accountHolder: '김학생',
        },
      },
      healthIssue: {
        summary: '건강상의 이유로 인한 환불',
        value: {
          sessionEnrollmentId: 2,
          reason: 'HEALTH_ISSUE',
          detailedReason: '건강상의 이유로 수업 참여가 어려워졌습니다.',
          refundAmount: 50000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '환불 요청이 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        reason: 'PERSONAL_SCHEDULE',
        detailedReason: '개인 일정 변경으로 인해 수업 참여가 어려워졌습니다.',
        refundAmount: 50000,
        bankName: '신한은행',
        accountNumber: '110-123456789',
        accountHolder: '김학생',
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00.000Z',
        sessionEnrollment: {
          id: 1,
          status: 'REFUND_REQUESTED',
          cancelledAt: '2024-01-15T10:30:00.000Z',
          session: {
            id: 1,
            date: '2024-01-15T00:00:00.000Z',
            startTime: '2024-01-15T18:00:00.000Z',
            endTime: '2024-01-15T20:00:00.000Z',
            class: {
              id: 1,
              className: '발레 기초반',
              teacher: {
                id: 1,
                name: '김강사',
              },
            },
          },
        },
        student: {
          id: 1,
          name: '김학생',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: '수업이 이미 시작되었거나 잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '수업이 이미 시작되어 환불 요청할 수 없습니다.',
        code: 'SESSION_ALREADY_STARTED',
        details: {
          sessionStartTime: '2024-01-15T18:00:00.000Z',
          currentTime: '2024-01-15T19:00:00.000Z',
          sessionEnrollmentId: 1,
        },
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 환불 요청이 진행 중',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 환불 요청이 진행 중입니다.',
        code: 'REFUND_REQUEST_ALREADY_EXISTS',
        details: {
          sessionEnrollmentId: 1,
          existingRefundRequestId: 1,
          existingStatus: 'PENDING',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션 수강 신청을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션 수강 신청을 찾을 수 없습니다.',
        code: 'SESSION_ENROLLMENT_NOT_FOUND',
        details: { sessionEnrollmentId: 999 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: '자신의 수강 신청만 환불 요청 가능',
    schema: {
      example: {
        statusCode: 403,
        message: '자신의 수강 신청만 환불 요청할 수 있습니다.',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          studentId: 1,
          enrollmentStudentId: 2,
          sessionEnrollmentId: 1,
        },
      },
    },
  })
  async createRefundRequest(
    @Body() dto: RefundRequestDto,
    @CurrentUser() user: any,
  ) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.refundService.findStudentByUserId(user.userId);

    return this.refundService.createRefundRequest(dto, student.id);
  }

  /**
   * 환불 요청 취소
   */
  @Delete('request/:refundRequestId')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '환불 요청 취소',
    description:
      '학생이 자신의 환불 요청을 취소합니다. 대기 중인 환불 요청만 취소할 수 있습니다.',
    operationId: 'cancelRefundRequest',
  })
  @ApiParam({
    name: 'refundRequestId',
    description: '취소할 환불 요청의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '환불 요청이 성공적으로 취소되었습니다.',
    schema: {
      example: {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        reason: 'PERSONAL_SCHEDULE',
        detailedReason: '개인 일정 변경으로 인해 수업 참여가 어려워졌습니다.',
        refundAmount: 50000,
        status: 'CANCELLED',
        cancelledAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '대기 중인 환불 요청만 취소 가능',
    schema: {
      example: {
        statusCode: 400,
        message: '대기 중인 환불 요청만 취소할 수 있습니다.',
        code: 'REFUND_REQUEST_NOT_PENDING',
        details: {
          refundRequestId: 1,
          currentStatus: 'APPROVED',
          requiredStatus: 'PENDING',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '환불 요청을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '환불 요청을 찾을 수 없습니다.',
        code: 'REFUND_REQUEST_NOT_FOUND',
        details: { refundRequestId: 999 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: '자신의 환불 요청만 취소 가능',
    schema: {
      example: {
        statusCode: 403,
        message: '자신의 환불 요청만 취소할 수 있습니다.',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          studentId: 1,
          refundRequestStudentId: 2,
          refundRequestId: 1,
        },
      },
    },
  })
  async cancelRefundRequest(
    @Param('refundRequestId', ParseIntPipe) refundRequestId: number,
    @CurrentUser() user: any,
  ) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.refundService.findStudentByUserId(user.userId);

    return this.refundService.cancelRefundRequest(refundRequestId, student.id);
  }

  /**
   * 학생별 환불 요청 목록 조회
   */
  @Get('student')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '학생별 환불 요청 목록 조회',
    description: '현재 로그인한 학생의 모든 환불 요청 목록을 조회합니다.',
    operationId: 'getStudentRefundRequests',
  })
  @ApiResponse({
    status: 200,
    description: '환불 요청 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          reason: 'PERSONAL_SCHEDULE',
          detailedReason: '개인 일정 변경으로 인해 수업 참여가 어려워졌습니다.',
          refundAmount: 50000,
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00.000Z',
          sessionEnrollment: {
            id: 1,
            status: 'REFUND_REQUESTED',
            session: {
              id: 1,
              date: '2024-01-15T00:00:00.000Z',
              startTime: '2024-01-15T18:00:00.000Z',
              endTime: '2024-01-15T20:00:00.000Z',
              class: {
                id: 1,
                className: '발레 기초반',
              },
            },
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: '학생 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getStudentRefundRequests(@CurrentUser() user: any) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.refundService.findStudentByUserId(user.userId);

    return this.refundService.getStudentRefundRequests(student.id);
  }

  /**
   * 전체 환불 요청 목록 조회 (관리자용)
   */
  @Get('all')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({
    summary: '전체 환불 요청 목록 조회',
    description:
      '원장 권한으로 모든 환불 요청 목록을 조회합니다. 상태별 필터링이 가능합니다.',
    operationId: 'getAllRefundRequests',
  })
  @ApiQuery({
    name: 'status',
    description: '환불 요청 상태로 필터링 (선택사항)',
    required: false,
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PARTIAL_APPROVED', 'CANCELLED'],
  })
  @ApiResponse({
    status: 200,
    description: '전체 환불 요청 목록을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          reason: 'PERSONAL_SCHEDULE',
          detailedReason: '개인 일정 변경으로 인해 수업 참여가 어려워졌습니다.',
          refundAmount: 50000,
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00.000Z',
          sessionEnrollment: {
            id: 1,
            status: 'REFUND_REQUESTED',
            session: {
              id: 1,
              date: '2024-01-15T00:00:00.000Z',
              startTime: '2024-01-15T18:00:00.000Z',
              endTime: '2024-01-15T20:00:00.000Z',
              class: {
                id: 1,
                className: '발레 기초반',
              },
            },
          },
          student: {
            id: 1,
            name: '김학생',
          },
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: '원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getAllRefundRequests(@Query('status') status?: string) {
    return this.refundService.getAllRefundRequests(status);
  }

  /**
   * 환불 요청 상세 조회
   */
  @Get(':refundRequestId')
  @Roles(Role.PRINCIPAL, Role.STUDENT)
  @ApiOperation({
    summary: '환불 요청 상세 조회',
    description:
      '특정 환불 요청의 상세 정보를 조회합니다. 원장과 해당 학생만 조회할 수 있습니다.',
    operationId: 'getRefundRequest',
  })
  @ApiParam({
    name: 'refundRequestId',
    description: '조회할 환불 요청의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '환불 요청 상세 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        reason: 'PERSONAL_SCHEDULE',
        detailedReason: '개인 일정 변경으로 인해 수업 참여가 어려워졌습니다.',
        refundAmount: 50000,
        bankName: '신한은행',
        accountNumber: '110-123456789',
        accountHolder: '김학생',
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00.000Z',
        sessionEnrollment: {
          id: 1,
          status: 'REFUND_REQUESTED',
          cancelledAt: '2024-01-15T10:30:00.000Z',
          session: {
            id: 1,
            date: '2024-01-15T00:00:00.000Z',
            startTime: '2024-01-15T18:00:00.000Z',
            endTime: '2024-01-15T20:00:00.000Z',
            class: {
              id: 1,
              className: '발레 기초반',
              teacher: {
                id: 1,
                name: '김강사',
              },
            },
          },
        },
        student: {
          id: 1,
          name: '김학생',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '환불 요청을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '환불 요청을 찾을 수 없습니다.',
        code: 'REFUND_REQUEST_NOT_FOUND',
        details: { refundRequestId: 999 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: '인증 토큰이 없거나 만료됨',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: '원장 또는 해당 학생만 조회 가능',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getRefundRequest(
    @Param('refundRequestId', ParseIntPipe) refundRequestId: number,
  ) {
    return this.refundService.getRefundRequest(refundRequestId);
  }
}

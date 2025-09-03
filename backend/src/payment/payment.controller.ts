import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
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
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '결제 생성',
    description:
      '학생이 특정 세션 수강 신청에 대한 결제를 생성합니다. 이미 결제가 완료된 세션인 경우 오류가 발생합니다.',
    operationId: 'createPayment',
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: '결제 생성 정보',
    examples: {
      cardPayment: {
        summary: '카드 결제',
        value: {
          sessionEnrollmentId: 1,
          studentId: 1,
          amount: 50000,
          status: 'COMPLETED',
          method: 'CARD',
          paidAt: '2024-01-15T10:30:00.000Z',
        },
      },
      bankTransfer: {
        summary: '계좌이체',
        value: {
          sessionEnrollmentId: 2,
          studentId: 1,
          amount: 50000,
          status: 'PENDING',
          method: 'BANK_TRANSFER',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '결제가 성공적으로 생성되었습니다.',
    schema: {
      example: {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        status: 'COMPLETED',
        method: 'CARD',
        paidAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
        sessionEnrollment: {
          id: 1,
          status: 'CONFIRMED',
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
    description: '이미 결제가 완료된 세션이거나 잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '이미 결제가 완료된 세션입니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션 수강 신청을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션 수강 신청을 찾을 수 없습니다.',
        error: 'Not Found',
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
    description: '학생 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Get('session-enrollment/:sessionEnrollmentId')
  @Roles(Role.STUDENT, Role.TEACHER)
  @ApiOperation({
    summary: '세션 수강 신청별 결제 정보 조회',
    description:
      '특정 세션 수강 신청에 대한 결제 정보를 조회합니다. 학생과 강사 모두 조회할 수 있습니다.',
    operationId: 'getPaymentBySessionEnrollment',
  })
  @ApiParam({
    name: 'sessionEnrollmentId',
    description: '결제 정보를 조회할 세션 수강 신청의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '결제 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        status: 'COMPLETED',
        method: 'CARD',
        paidAt: '2024-01-15T10:30:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
        sessionEnrollment: {
          id: 1,
          status: 'CONFIRMED',
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
    description: '결제 정보를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '결제 정보를 찾을 수 없습니다.',
        error: 'Not Found',
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
    description: '학생 또는 강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async getPaymentBySessionEnrollment(
    @Param('sessionEnrollmentId', ParseIntPipe) sessionEnrollmentId: number,
  ) {
    return this.paymentService.getPaymentBySessionEnrollment(
      sessionEnrollmentId,
    );
  }

  @Get('student/:studentId')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '학생별 결제 내역 조회',
    description:
      '특정 학생의 모든 결제 내역을 조회합니다. 결제 완료 시간 순으로 정렬됩니다.',
    operationId: 'getStudentPayments',
  })
  @ApiParam({
    name: 'studentId',
    description: '결제 내역을 조회할 학생의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '학생의 결제 내역을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          amount: 50000,
          status: 'COMPLETED',
          method: 'CARD',
          paidAt: '2024-01-15T10:30:00.000Z',
          createdAt: '2024-01-15T10:30:00.000Z',
          sessionEnrollment: {
            id: 1,
            status: 'CONFIRMED',
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
  async getStudentPayments(
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.paymentService.getStudentPayments(studentId);
  }

  @Put('session-enrollment/:sessionEnrollmentId')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '결제 정보 업데이트',
    description:
      '강사 권한으로 결제 정보를 수정합니다. 결제 상태, 방법, 금액, 완료 시간 등을 변경할 수 있습니다.',
    operationId: 'updatePayment',
  })
  @ApiParam({
    name: 'sessionEnrollmentId',
    description: '수정할 결제 정보의 세션 수강 신청 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: UpdatePaymentDto,
    description: '수정할 결제 정보',
    examples: {
      completePayment: {
        summary: '결제 완료 처리',
        value: {
          status: 'COMPLETED',
          paidAt: '2024-01-15T10:30:00.000Z',
        },
      },
      updateAmount: {
        summary: '결제 금액 수정',
        value: {
          amount: 60000,
          status: 'COMPLETED',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '결제 정보가 성공적으로 업데이트되었습니다.',
    schema: {
      example: {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 60000,
        status: 'COMPLETED',
        method: 'CARD',
        paidAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
        sessionEnrollment: {
          id: 1,
          status: 'CONFIRMED',
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
    description: '잘못된 입력값',
    schema: {
      example: {
        statusCode: 400,
        message: '잘못된 결제 상태입니다.',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '결제 정보를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '결제 정보를 찾을 수 없습니다.',
        error: 'Not Found',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async updatePayment(
    @Param('sessionEnrollmentId', ParseIntPipe) sessionEnrollmentId: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentService.updatePayment(sessionEnrollmentId, dto);
  }

  @Delete('session-enrollment/:sessionEnrollmentId')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '결제 삭제',
    description:
      '강사 권한으로 결제 정보를 삭제합니다. 주의: 이 작업은 되돌릴 수 없습니다.',
    operationId: 'deletePayment',
  })
  @ApiParam({
    name: 'sessionEnrollmentId',
    description: '삭제할 결제 정보의 세션 수강 신청 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '결제가 성공적으로 삭제되었습니다.',
    schema: {
      example: {
        message: '결제가 삭제되었습니다.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '결제 정보를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '결제 정보를 찾을 수 없습니다.',
        error: 'Not Found',
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
    description: '강사 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  async deletePayment(
    @Param('sessionEnrollmentId', ParseIntPipe) sessionEnrollmentId: number,
  ) {
    return this.paymentService.deletePayment(sessionEnrollmentId);
  }
}

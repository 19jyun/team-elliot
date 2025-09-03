import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
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
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateEnrollmentStatusDto,
  BatchUpdateEnrollmentStatusDto,
  SessionEnrollmentStatus,
} from './dto/update-enrollment-status.dto';
import { ChangeEnrollmentDto } from './dto/change-enrollment.dto';

@ApiTags('ClassSession')
@Controller('class-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  // ===== 세션 관리 API =====

  /**
   * 클래스 세션 생성
   */
  @Post()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '클래스 세션 생성' })
  @ApiResponse({ status: 201, description: '세션 생성 성공' })
  async createClassSession(
    @Body()
    data: {
      classId: number;
      date: Date;
      startTime: Date;
      endTime: Date;
    },
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.createClassSession(data, user.id);
  }

  /**
   * 클래스 세션 수정
   */
  @Put(':sessionId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '클래스 세션 수정' })
  @ApiResponse({ status: 200, description: '세션 수정 성공' })
  async updateClassSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body()
    data: {
      date?: Date;
      startTime?: Date;
      endTime?: Date;
    },
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.updateClassSession(
      sessionId,
      data,
      user.id,
    );
  }

  /**
   * 클래스 세션 삭제
   */
  @Delete(':sessionId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '클래스 세션 삭제' })
  @ApiResponse({ status: 200, description: '세션 삭제 성공' })
  async deleteClassSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.deleteClassSession(sessionId, user.id);
  }

  /**
   * 선생님의 수강 신청 목록 조회
   */
  @Get('teacher/enrollments')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '선생님의 수강 신청 목록 조회' })
  @ApiResponse({ status: 200, description: '수강 신청 목록 조회 성공' })
  async getTeacherEnrollments(
    @CurrentUser() user: any,
    @Query('status') status?: SessionEnrollmentStatus,
    @Query('classId') classId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      ...(status && { status }),
      ...(classId && { classId: parseInt(classId) }),
      ...(sessionId && { sessionId: parseInt(sessionId) }),
      ...(startDate &&
        endDate && {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
    };

    return this.classSessionService.getTeacherEnrollments(user.id, filters);
  }

  /**
   * 개별 수강 신청 상태 업데이트 (승인/거부)
   */
  @Put('enrollments/:enrollmentId/status')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '수강 신청 상태 업데이트 (승인/거부)' })
  @ApiResponse({ status: 200, description: '상태 업데이트 성공' })
  async updateEnrollmentStatus(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Body() updateDto: UpdateEnrollmentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.updateEnrollmentStatus(
      enrollmentId,
      updateDto,
      user.id,
    );
  }

  /**
   * 배치 수강 신청 상태 업데이트
   */
  @Put('enrollments/batch-status')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '배치 수강 신청 상태 업데이트',
    description:
      '강사 권한으로 여러 수강 신청의 상태를 한 번에 변경합니다. 대량의 수강 신청을 효율적으로 처리할 수 있습니다.',
    operationId: 'batchUpdateEnrollmentStatus',
  })
  @ApiBody({
    type: BatchUpdateEnrollmentStatusDto,
    description: '배치 상태 변경 정보',
    examples: {
      batchApprove: {
        summary: '여러 수강 신청 일괄 승인',
        value: {
          enrollmentIds: [1, 2, 3, 4, 5],
          status: 'CONFIRMED',
          reason: '일괄 승인 처리',
        },
      },
      batchReject: {
        summary: '여러 수강 신청 일괄 거부',
        value: {
          enrollmentIds: [6, 7, 8],
          status: 'REJECTED',
          reason: '수업 인원 초과로 일괄 거부',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '배치 상태 업데이트 성공',
    schema: {
      example: {
        message: '5개의 수강 신청 상태가 성공적으로 변경되었습니다.',
        updatedCount: 5,
        results: [
          { id: 1, status: 'CONFIRMED', success: true },
          { id: 2, status: 'CONFIRMED', success: true },
          { id: 3, status: 'CONFIRMED', success: true },
          { id: 4, status: 'CONFIRMED', success: true },
          { id: 5, status: 'CONFIRMED', success: true },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 상태 값 또는 빈 수강 신청 목록',
    schema: {
      example: {
        statusCode: 400,
        message: '유효하지 않은 수강 신청 상태입니다.',
        code: 'INVALID_STATUS',
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
  async batchUpdateEnrollmentStatus(
    @Body() batchDto: BatchUpdateEnrollmentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.batchUpdateEnrollmentStatus(
      batchDto,
      user.id,
    );
  }

  /**
   * 출석 체크
   */
  @Put('enrollments/:enrollmentId/attendance')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '출석 체크',
    description:
      '강사 권한으로 특정 수강 신청에 대한 출석 상태를 체크합니다. ATTENDED(출석) 또는 ABSENT(결석)으로 설정할 수 있습니다.',
    operationId: 'checkAttendance',
  })
  @ApiParam({
    name: 'enrollmentId',
    description: '출석을 체크할 수강 신청의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: '출석 상태',
          enum: ['ATTENDED', 'ABSENT'],
          example: 'ATTENDED',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '출석 체크 성공',
    schema: {
      example: {
        id: 1,
        attendanceStatus: 'ATTENDED',
        updatedAt: '2024-01-15T18:30:00.000Z',
        message: '출석이 성공적으로 체크되었습니다.',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 출석 상태 값',
    schema: {
      example: {
        statusCode: 400,
        message: '출석 상태는 ATTENDED 또는 ABSENT여야 합니다.',
        code: 'INVALID_ATTENDANCE_STATUS',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '수강 신청을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '수강 신청을 찾을 수 없습니다.',
        code: 'ENROLLMENT_NOT_FOUND',
        details: { enrollmentId: 999 },
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
  async checkAttendance(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Body('status') attendanceStatus: 'ATTENDED' | 'ABSENT',
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.checkAttendance(
      enrollmentId,
      attendanceStatus,
      user.id,
    );
  }

  /**
   * 수업 완료 처리 (스케줄러용)
   */
  @Post('complete-sessions')
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '수업 완료 처리 (스케줄러용)',
    description:
      '강사 권한으로 지난 시간의 세션들을 자동으로 완료 처리합니다. 스케줄러에서 주기적으로 호출됩니다.',
    operationId: 'completeSessions',
  })
  @ApiResponse({
    status: 200,
    description: '수업 완료 처리 성공',
    schema: {
      example: {
        message: '3개의 세션이 성공적으로 완료 처리되었습니다.',
        completedCount: 3,
        completedSessions: [
          { id: 1, className: '발레 기초반', date: '2024-01-15T00:00:00.000Z' },
          { id: 2, className: '발레 중급반', date: '2024-01-15T00:00:00.000Z' },
          { id: 3, className: '발레 고급반', date: '2024-01-15T00:00:00.000Z' },
        ],
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
  async completeSessions() {
    return this.classSessionService.updateCompletedSessions();
  }

  // ===== 학생용 API (기존) =====

  @Post(':sessionId/enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '세션별 수강 신청',
    description:
      '학생이 특정 세션에 수강 신청을 합니다. 이미 신청한 세션이거나 수강 인원이 초과된 경우 오류가 발생합니다.',
    operationId: 'enrollSession',
  })
  @ApiParam({
    name: 'sessionId',
    description: '수강 신청할 세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 201,
    description: '세션 수강 신청이 성공적으로 완료되었습니다.',
    schema: {
      example: {
        id: 1,
        studentId: 1,
        sessionId: 1,
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00.000Z',
        session: {
          id: 1,
          date: '2024-01-15T00:00:00.000Z',
          startTime: '2024-01-15T18:00:00.000Z',
          endTime: '2024-01-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 수강 신청한 세션이거나 수강 인원 초과',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 수강 신청한 세션입니다.',
        code: 'ALREADY_ENROLLED',
        details: { sessionId: 1, studentId: 1 },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '세션 또는 학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '세션을 찾을 수 없습니다.',
        code: 'SESSION_NOT_FOUND',
        details: { sessionId: 999 },
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
  async enrollSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.classSessionService.findStudentByUserId(
      user.userId,
    );

    return this.classSessionService.enrollSession(sessionId, student.id);
  }

  @Post('batch-enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '여러 세션 일괄 수강 신청',
    description:
      '학생이 여러 세션에 동시에 수강 신청을 합니다. 각 세션별로 수강 가능 여부가 검증됩니다.',
    operationId: 'batchEnrollSessions',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionIds: {
          type: 'array',
          items: { type: 'number' },
          description: '수강 신청할 세션 ID 목록',
          example: [1, 2, 3],
        },
      },
      required: ['sessionIds'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '일괄 수강 신청이 성공적으로 완료되었습니다.',
    schema: {
      example: {
        message: '3개 중 2개의 세션에 성공적으로 신청되었습니다.',
        totalCount: 3,
        successCount: 2,
        failedCount: 1,
        results: [
          { sessionId: 1, success: true, status: 'PENDING' },
          { sessionId: 2, success: true, status: 'PENDING' },
          {
            sessionId: 3,
            success: false,
            reason: '이미 수강 신청한 세션입니다.',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: '빈 세션 목록 또는 잘못된 세션 ID',
    schema: {
      example: {
        statusCode: 400,
        message: '세션 ID 목록이 비어있습니다.',
        code: 'EMPTY_SESSION_LIST',
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
  async batchEnrollSessions(
    @Body() data: { sessionIds: number[] },
    @CurrentUser() user: any,
  ) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.classSessionService.findStudentByUserId(
      user.userId,
    );

    return this.classSessionService.batchEnrollSessions(
      data.sessionIds,
      student.id,
    );
  }

  /**
   * 학생 수강 취소
   */
  @Delete('enrollments/:enrollmentId')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '학생 수강 취소',
    description:
      '학생이 자신의 수강 신청을 취소합니다. 이미 진행된 세션이거나 취소 불가능한 상태인 경우 오류가 발생합니다.',
    operationId: 'cancelEnrollment',
  })
  @ApiParam({
    name: 'enrollmentId',
    description: '취소할 수강 신청의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '수강 취소 성공',
    schema: {
      example: {
        message: '수강 신청이 성공적으로 취소되었습니다.',
        enrollmentId: 1,
        cancelledAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '취소할 수 없는 상태',
    schema: {
      example: {
        statusCode: 400,
        message: '이미 진행된 세션은 취소할 수 없습니다.',
        code: 'SESSION_ALREADY_STARTED',
        details: { sessionId: 1, startTime: '2024-01-15T18:00:00.000Z' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '수강 신청을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '수강 신청을 찾을 수 없습니다.',
        code: 'ENROLLMENT_NOT_FOUND',
        details: { enrollmentId: 999 },
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
  async cancelEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @CurrentUser() user: any,
  ) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.classSessionService.findStudentByUserId(
      user.userId,
    );

    return this.classSessionService.cancelEnrollment(enrollmentId, student.id);
  }

  /**
   * 학생의 수강 신청 목록 조회
   */
  @Get('student/enrollments')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '학생의 수강 신청 목록 조회' })
  @ApiResponse({ status: 200, description: '수강 신청 목록 조회 성공' })
  async getStudentEnrollments(
    @CurrentUser() user: any,
    @Query('status') status?: SessionEnrollmentStatus,
    @Query('classId') classId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // JWT sub (User.id)를 통해 Student의 ID를 가져오기
    const student = await this.classSessionService.findStudentByUserId(
      user.userId,
    );

    const filters = {
      ...(status && { status }),
      ...(classId && { classId: parseInt(classId) }),
      ...(startDate &&
        endDate && {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
    };

    return this.classSessionService.getStudentEnrollments(student.id, filters);
  }

  /**
   * 특정 세션의 수강생 목록 조회
   */
  @Get(':sessionId/enrollments')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '특정 세션의 수강생 목록 조회' })
  @ApiResponse({ status: 200, description: '세션별 수강생 목록 조회 성공' })
  async getSessionEnrollments(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.getSessionEnrollments(sessionId, user.id);
  }

  // ===== 조회 API =====

  @Get('class/:classId')
  @Roles(Role.STUDENT, Role.TEACHER, Role.PRINCIPAL)
  @ApiOperation({ summary: '클래스별 세션 목록 조회' })
  async getClassSessions(
    @Param('classId', ParseIntPipe) classId: number,
    @CurrentUser() user: any,
  ) {
    let studentId: number | undefined;

    if (user.role === 'STUDENT') {
      // JWT sub (User.id)를 통해 Student의 ID를 가져오기
      const student = await this.classSessionService[
        'prisma'
      ].student.findFirst({
        where: { userId: user.userId },
      });

      if (!student) {
        throw new NotFoundException('Student를 찾을 수 없습니다.');
      }

      studentId = student.id;
    }

    return this.classSessionService.getClassSessions(classId, studentId);
  }

  @Get('class/:classId/modification')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '수강 변경용 클래스 세션 목록 조회' })
  async getClassSessionsForModification(
    @Param('classId', ParseIntPipe) classId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.getClassSessionsForModification(
      classId,
      user.id,
    );
  }

  /**
   * 선택된 클래스들의 모든 세션 조회 (enrollment/modification 모드용)
   */
  @Get('classes/enrollment')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '선택된 클래스들의 모든 세션 조회' })
  @ApiResponse({ status: 200, description: '세션 조회 성공' })
  async getClassSessionsForEnrollment(
    @Query('classIds') classIds: string,
    @CurrentUser() user: any,
  ) {
    const classIdArray = classIds.split(',').map((id) => parseInt(id.trim()));
    return this.classSessionService.getClassSessionsForEnrollment(
      classIdArray,
      user.id,
    );
  }

  /**
   * 학생의 수강 가능한 모든 세션 조회 (새로운 수강신청 플로우용)
   */
  @Get('student/available-enrollment')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '학생의 수강 가능한 모든 세션 조회' })
  @ApiResponse({ status: 200, description: '수강 가능한 세션 조회 성공' })
  async getStudentAvailableSessionsForEnrollment(
    @Query('academyId') academyId: string,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.getStudentAvailableSessionsForEnrollment(
      parseInt(academyId),
      user.id,
    );
  }

  /**
   * 수강 변경 (기존 수강 취소 + 새로운 수강 신청)
   */
  @Put('enrollments/:enrollmentId/change')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '수강 변경 (기존 수강 취소 + 새로운 수강 신청)' })
  @ApiResponse({ status: 200, description: '수강 변경 성공' })
  async changeEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Body() changeDto: ChangeEnrollmentDto,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.changeEnrollment(
      enrollmentId,
      changeDto,
      user.id,
    );
  }

  /**
   * 학생의 특정 클래스 수강 신청 현황 조회 (수강 변경/취소용)
   */
  @Get('class/:classId/student-enrollments')
  @Roles(Role.STUDENT)
  @ApiOperation({
    summary: '학생의 특정 클래스 수강 신청 현황 조회 (수강 변경/취소용)',
  })
  @ApiResponse({ status: 200, description: '수강 신청 현황 조회 성공' })
  async getStudentClassEnrollments(
    @Param('classId', ParseIntPipe) classId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.getStudentClassEnrollments(
      classId,
      user.id,
    );
  }

  /**
   * 배치 수강 변경/취소 처리
   */
  @Post('batch-modify')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '배치 수강 변경/취소 처리' })
  @ApiResponse({ status: 200, description: '배치 수강 변경/취소 성공' })
  async batchModifyEnrollments(
    @Body()
    data: {
      cancellations: number[];
      newEnrollments: number[];
      reason?: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.batchModifyEnrollments(data, user.id);
  }
}

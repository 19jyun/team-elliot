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
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
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

@ApiTags('Student')
@Controller('student')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('classes')
  @ApiOperation({
    summary: '내 수강 클래스 목록 조회',
    description:
      '학생이 현재 수강 중인 모든 클래스와 세션 정보를 조회합니다. 활성 상태의 수강 신청만 포함됩니다.',
    operationId: 'getMyClasses',
  })
  @ApiResponse({
    status: 200,
    description: '수강 중인 클래스와 세션 정보를 반환합니다.',
    schema: {
      example: {
        enrollmentClasses: [
          {
            id: 1,
            name: '발레 기초반',
            description: '발레의 기본 동작을 배우는 클래스입니다.',
            maxStudents: 15,
            price: 50000,
            teacher: {
              id: 1,
              name: '김강사',
            },
          },
        ],
        sessionClasses: [
          {
            id: 1,
            name: '1주차 - 기본 자세',
            date: '2024-01-15T18:00:00.000Z',
            startTime: '18:00:00',
            endTime: '20:00:00',
            enrollment_status: 'CONFIRMED',
            enrollment_id: 1,
          },
        ],
        calendarRange: {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-04-30T23:59:59.999Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
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
  async getMyClasses(@CurrentUser() user: any) {
    return this.studentService.getStudentClasses(user.id);
  }

  @Get('classes/:id')
  @ApiOperation({
    summary: '클래스 상세 정보 조회',
    description:
      '특정 클래스의 상세 정보를 조회합니다. 강사 정보와 수강 신청 현황을 포함합니다.',
    operationId: 'getClassDetail',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 클래스의 고유 ID',
    example: 1,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '클래스 상세 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        name: '발레 기초반',
        description: '발레의 기본 동작을 배우는 클래스입니다.',
        maxStudents: 15,
        price: 50000,
        teacher: {
          id: 1,
          name: '김강사',
          photoUrl: '/uploads/teacher-photos/teacher001.jpg',
          introduction: '발레 전문 강사입니다.',
        },
        enrollments: [
          {
            id: 1,
            studentId: 1,
            status: 'CONFIRMED',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: '클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '수업을 찾을 수 없습니다.',
        code: 'CLASS_NOT_FOUND',
        details: { classId: 1 },
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
  async getClassDetail(@Param('id') id: string) {
    return this.studentService.getClassDetail(Number(id));
  }

  @Post('classes/:id/enroll')
  @ApiOperation({
    summary: '클래스 수강 신청',
    description:
      '학생이 특정 클래스에 수강 신청을 합니다. 이미 신청한 클래스인 경우 오류가 발생합니다.',
    operationId: 'enrollClass',
  })
  @ApiParam({
    name: 'id',
    description: '수강 신청할 클래스의 고유 ID',
    example: 1,
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: '수강 신청이 성공적으로 완료되었습니다.',
    schema: {
      example: {
        id: 1,
        studentId: 1,
        classId: 1,
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학생 또는 클래스를 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
      },
    },
  })
  @ApiConflictResponse({
    description: '이미 수강 신청한 클래스',
    schema: {
      example: {
        statusCode: 409,
        message: '이미 수강 신청한 클래스입니다.',
        code: 'STUDENT_ALREADY_ENROLLED',
        details: { classId: 1 },
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
  async enrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.enrollClass(Number(classId), user.id);
  }

  @Delete('classes/:id/enroll')
  @ApiOperation({
    summary: '클래스 수강 신청 취소',
    description: '학생이 특정 클래스의 수강 신청을 취소합니다.',
    operationId: 'unenrollClass',
  })
  @ApiParam({
    name: 'id',
    description: '수강 신청을 취소할 클래스의 고유 ID',
    example: 1,
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '수강 신청 취소가 성공적으로 완료되었습니다.',
    schema: {
      example: {
        message: '수강 신청이 취소되었습니다.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학생 또는 수강 신청 내역을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '수강 신청 내역을 찾을 수 없습니다.',
        code: 'ENROLLMENT_NOT_FOUND',
        details: { classId: 1, studentId: 1 },
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
  async unenrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.unenrollClass(Number(classId), user.id);
  }

  @Get('profile')
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '학생의 개인 프로필 정보를 조회합니다.',
    operationId: 'getMyProfile',
  })
  @ApiResponse({
    status: 200,
    description: '학생 프로필 정보를 반환합니다.',
    schema: {
      example: {
        id: 1,
        userId: 'student001',
        name: '김학생',
        phoneNumber: '010-1234-5678',
        emergencyContact: '010-2345-6789',
        birthDate: '2010-01-15',
        notes: '발레 초급자입니다.',
        level: 'BEGINNER',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
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
  async getMyProfile(@CurrentUser() user: any) {
    return this.studentService.getMyProfile(user.id);
  }

  @Put('profile')
  @ApiOperation({
    summary: '프로필 수정',
    description:
      '학생의 개인 프로필 정보를 수정합니다. 이름, 전화번호, 비상연락처, 생년월일, 노트, 레벨 등을 수정할 수 있습니다.',
    operationId: 'updateMyProfile',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: '수정할 프로필 정보',
    examples: {
      basic: {
        summary: '기본 정보 수정',
        value: {
          name: '김학생',
          phoneNumber: '010-1234-5678',
          emergencyContact: '010-2345-6789',
          birthDate: '2010-01-15',
          notes: '발레 초급자입니다.',
          level: 'BEGINNER',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '프로필이 성공적으로 수정되었습니다.',
    schema: {
      example: {
        id: 1,
        userId: 'student001',
        name: '김학생',
        phoneNumber: '010-1234-5678',
        emergencyContact: '010-2345-6789',
        birthDate: '2010-01-15',
        notes: '발레 초급자입니다.',
        level: 'BEGINNER',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: '잘못된 입력값 (이름 길이, 전화번호 형식 등)',
    schema: {
      example: {
        statusCode: 400,
        message: [
          '이름은 2자 이상이어야 합니다.',
          '올바른 전화번호 형식이 아닙니다.',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
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
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.studentService.updateMyProfile(user.id, updateProfileDto);
  }

  @Get('enrollment-history')
  @ApiOperation({
    summary: '수강 신청 이력 조회',
    description: '학생의 모든 수강 신청 이력을 조회합니다.',
    operationId: 'getEnrollmentHistory',
  })
  @ApiResponse({
    status: 200,
    description: '수강 신청 이력을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          studentId: 1,
          classId: 1,
          status: 'CONFIRMED',
          createdAt: '2024-01-15T10:30:00.000Z',
          class: {
            id: 1,
            name: '발레 기초반',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
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
  async getEnrollmentHistory(@CurrentUser() user: any) {
    return this.studentService.getEnrollmentHistory(user.id);
  }

  @Get('cancellation-history')
  @ApiOperation({
    summary: '수강 취소 이력 조회',
    description: '학생의 모든 수강 취소 이력을 조회합니다.',
    operationId: 'getCancellationHistory',
  })
  @ApiResponse({
    status: 200,
    description: '수강 취소 이력을 반환합니다.',
    schema: {
      example: [
        {
          id: 1,
          studentId: 1,
          classId: 1,
          status: 'CANCELLED',
          cancelledAt: '2024-01-15T10:30:00.000Z',
          class: {
            id: 1,
            name: '발레 기초반',
          },
        },
      ],
    },
  })
  @ApiNotFoundResponse({
    description: '학생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '학생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_FOUND',
        details: { userId: 1 },
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
  async getCancellationHistory(@CurrentUser() user: any) {
    return this.studentService.getCancellationHistory(user.id);
  }

  // 세션별 입금 정보 조회 (결제 시 사용)
  @Get('sessions/:sessionId/payment-info')
  @ApiOperation({
    summary: '세션별 입금 정보 조회',
    description: '특정 세션에 대한 입금 정보를 조회합니다. 결제 시 사용됩니다.',
    operationId: 'getSessionPaymentInfo',
  })
  @ApiParam({
    name: 'sessionId',
    description: '입금 정보를 조회할 세션의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '세션의 입금 정보를 반환합니다.',
    schema: {
      example: {
        sessionId: 1,
        sessionName: '1주차 - 기본 자세',
        price: 50000,
        paymentStatus: 'PENDING',
        dueDate: '2024-01-20T23:59:59.999Z',
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
        details: { sessionId: 1 },
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
  async getSessionPaymentInfo(
    @CurrentUser() user: any,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.studentService.getSessionPaymentInfo(user.id, sessionId);
  }

  // === 학원 관리 API (선생님용) ===

  // 수강생을 학원에서 제거
  @Delete('academy/students/:studentId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  @ApiOperation({
    summary: '수강생을 학원에서 제거',
    description:
      '원장 권한으로 수강생을 학원에서 완전히 제거합니다. 모든 관련 데이터(수강 내역, 결제 내역, 출석 기록 등)가 삭제됩니다.',
    operationId: 'removeStudentFromAcademy',
  })
  @ApiParam({
    name: 'studentId',
    description: '제거할 수강생의 고유 ID',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: '수강생이 학원에서 제거되었습니다.',
    schema: {
      example: {
        message: '수강생이 학원에서 제거되었습니다.',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '수강생을 찾을 수 없음',
    schema: {
      example: {
        statusCode: 404,
        message: '해당 수강생을 찾을 수 없습니다.',
        code: 'STUDENT_NOT_IN_ACADEMY',
        details: { studentId: 1, academyId: 1 },
      },
    },
  })
  @ApiForbiddenResponse({
    description: '원장 권한이 부족함',
    schema: {
      example: {
        statusCode: 403,
        message: '학원 관리 권한이 없습니다.',
        details: { teacherId: 1, requiredRole: 'PRINCIPAL' },
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
  async removeStudentFromAcademy(
    @CurrentUser() user: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.studentService.removeStudentFromAcademy(user.id, studentId);
  }
}

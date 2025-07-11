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
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @Roles(Role.TEACHER, Role.ADMIN)
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
  @Roles(Role.TEACHER, Role.ADMIN)
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
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '클래스 세션 삭제' })
  @ApiResponse({ status: 200, description: '세션 삭제 성공' })
  async deleteClassSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.deleteClassSession(sessionId, user.id);
  }

  // ===== 선생님/관리자용 수강 신청 관리 API =====

  /**
   * 선생님의 수강 신청 목록 조회
   */
  @Get('teacher/enrollments')
  @Roles(Role.TEACHER, Role.ADMIN)
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
  @Roles(Role.TEACHER, Role.ADMIN)
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
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '배치 수강 신청 상태 업데이트' })
  @ApiResponse({ status: 200, description: '배치 상태 업데이트 성공' })
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
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '출석 체크' })
  @ApiResponse({ status: 200, description: '출석 체크 성공' })
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
   * 특정 세션의 수강생 목록 조회
   */
  @Get(':sessionId/enrollments')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '특정 세션의 수강생 목록 조회' })
  @ApiResponse({ status: 200, description: '세션별 수강생 목록 조회 성공' })
  async getSessionEnrollments(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.getSessionEnrollments(sessionId, user.id);
  }

  /**
   * 선생님의 모든 세션 조회 (달력용)
   */
  @Get('teacher/sessions')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '선생님의 모든 세션 조회 (달력용)' })
  @ApiResponse({ status: 200, description: '선생님 세션 목록 조회 성공' })
  async getTeacherSessions(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      ...(startDate &&
        endDate && {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
    };

    return this.classSessionService.getTeacherSessions(user.id, filters);
  }

  /**
   * 수업 완료 처리 (스케줄러용)
   */
  @Post('complete-sessions')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '수업 완료 처리 (스케줄러용)' })
  @ApiResponse({ status: 200, description: '수업 완료 처리 성공' })
  async completeSessions() {
    return this.classSessionService.updateCompletedSessions();
  }

  // ===== 학생용 API (기존) =====

  @Post(':sessionId/enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '세션별 수강 신청' })
  async enrollSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.enrollSession(sessionId, user.id);
  }

  @Post('batch-enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '여러 세션 일괄 수강 신청' })
  async batchEnrollSessions(
    @Body() data: { sessionIds: number[] },
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.batchEnrollSessions(
      data.sessionIds,
      user.id,
    );
  }

  /**
   * 학생 수강 취소
   */
  @Delete('enrollments/:enrollmentId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '학생 수강 취소' })
  @ApiResponse({ status: 200, description: '수강 취소 성공' })
  async cancelEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.cancelEnrollment(enrollmentId, user.id);
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
    const filters = {
      ...(status && { status }),
      ...(classId && { classId: parseInt(classId) }),
      ...(startDate &&
        endDate && {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
    };

    return this.classSessionService.getStudentEnrollments(user.id, filters);
  }

  // ===== 조회 API =====

  @Get('class/:classId')
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '클래스별 세션 목록 조회' })
  async getClassSessions(@Param('classId', ParseIntPipe) classId: number) {
    return this.classSessionService.getClassSessions(classId);
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

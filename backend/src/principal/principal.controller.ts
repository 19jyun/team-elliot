import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrincipalService } from './principal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { principalProfileConfig } from '../config/multer.config';
import { ClassService } from '../class/class.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('principal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PRINCIPAL)
export class PrincipalController {
  constructor(
    private readonly principalService: PrincipalService,
    private readonly classService: ClassService,
  ) {}

  // Principal의 학원 정보 조회
  @Get('academy')
  async getMyAcademy(@GetUser() user: any) {
    return this.principalService.getMyAcademy(user.id);
  }

  // Principal의 학원 모든 세션 조회
  @Get('sessions')
  async getAllSessions(@GetUser() user: any) {
    return this.principalService.getAllSessions(user.id);
  }

  // Principal의 학원 모든 클래스 조회
  @Get('classes')
  async getAllClasses(@GetUser() user: any) {
    return this.principalService.getAllClasses(user.id);
  }

  // Principal의 클래스 생성
  @Post('classes')
  async createClass(@GetUser() user: any, @Body() createClassDto: any) {
    // Principal의 학원 ID를 자동으로 설정
    const principalWithAcademy = await this.principalService.getPrincipalData(
      user.id,
    );
    const academyId = principalWithAcademy.academy?.id;

    if (!academyId) {
      throw new BadRequestException({
        code: 'ACADEMY_NOT_FOUND',
        message: 'Principal이 소속된 학원을 찾을 수 없습니다.',
      });
    }

    // academyId를 자동으로 설정
    const classData = {
      ...createClassDto,
      academyId: academyId,
    };

    return this.classService.createClass(classData, 'PRINCIPAL');
  }

  // Principal의 학원 모든 강사 조회
  @Get('teachers')
  async getAllTeachers(@GetUser() user: any) {
    return this.principalService.getAllTeachers(user.id);
  }

  // Principal의 학원 모든 학생 조회
  @Get('students')
  async getAllStudents(@GetUser() user: any) {
    return this.principalService.getAllStudents(user.id);
  }

  // Principal의 학원 모든 수강신청 조회 (Redux store용) - DEPRECATED: 필터링된 API 사용
  @Get('enrollments-all')
  async getAllEnrollments(@GetUser() user: any) {
    return this.principalService.getAllEnrollments(user.id);
  }

  // Principal의 학원 모든 환불요청 조회 (Redux store용)
  @Get('refund-requests')
  async getAllRefundRequests(@GetUser() user: any) {
    return this.principalService.getAllRefundRequests(user.id);
  }

  // Principal 정보 조회
  @Get('profile')
  async getPrincipalInfo(@GetUser() user: any) {
    return this.principalService.getPrincipalInfo(user.id);
  }

  // Principal의 은행 정보 조회
  @Get('bank-info')
  async getPrincipalBankInfo(@GetUser() user: any) {
    return this.principalService.getPrincipalBankInfo(user.id);
  }

  // Principal 전체 데이터 조회 (Redux 초기화용)
  @Get('me/data')
  async getPrincipalData(@GetUser() user: any) {
    return this.principalService.getPrincipalData(user.id);
  }

  // Principal 프로필 정보 수정
  @Put('profile')
  async updateProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.principalService.updateProfile(user.id, updateProfileDto);
  }

  // Principal 프로필 사진 업데이트
  @Put('profile/photo')
  @UseInterceptors(FileInterceptor('photo', principalProfileConfig))
  async updateProfilePhoto(
    @GetUser() user: any,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.principalService.updateProfilePhoto(user.id, photo);
  }

  // Principal의 세션 수강생 조회
  @Get('sessions/:sessionId/enrollments')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: 'Principal 세션 수강생 조회' })
  @ApiResponse({ status: 200, description: '세션 수강생 조회 성공' })
  async getSessionEnrollments(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionEnrollments(sessionId, user.id);
  }

  // Principal의 학원 정보 수정
  @Put('academy')
  async updateAcademy(
    @GetUser() user: any,
    @Body() updateAcademyDto: UpdateAcademyDto,
  ) {
    return this.principalService.updateAcademy(user.id, updateAcademyDto);
  }

  // === 수강 신청/환불 신청 관리 API ===

  // Principal의 수강 신청 대기 세션 목록 조회
  @Get('sessions-with-enrollment-requests')
  async getSessionsWithEnrollmentRequests(@GetUser() user: any) {
    return this.principalService.getSessionsWithEnrollmentRequests(user.id);
  }

  // Principal의 환불 요청 대기 세션 목록 조회
  @Get('sessions-with-refund-requests')
  async getSessionsWithRefundRequests(@GetUser() user: any) {
    return this.principalService.getSessionsWithRefundRequests(user.id);
  }

  // 특정 세션의 수강 신청 요청 목록 조회
  @Get('sessions/:sessionId/enrollment-requests')
  async getSessionEnrollmentRequests(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionEnrollmentRequests(
      sessionId,
      user.id,
    );
  }

  // 특정 세션의 환불 요청 목록 조회
  @Get('sessions/:sessionId/refund-requests')
  async getSessionRefundRequests(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionRefundRequests(sessionId, user.id);
  }

  // 수강 신청 승인
  @Post('enrollments/:enrollmentId/approve')
  async approveEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.approveEnrollment(enrollmentId, user.id);
  }

  // 수강 신청 거절
  @Post('enrollments/:enrollmentId/reject')
  async rejectEnrollment(
    @Param('enrollmentId', ParseIntPipe) enrollmentId: number,
    @Body() rejectData: { reason: string; detailedReason?: string },
    @GetUser() user: any,
  ) {
    return this.principalService.rejectEnrollment(
      enrollmentId,
      rejectData,
      user.id,
    );
  }

  // 환불 요청 승인
  @Post('refunds/:refundId/approve')
  async approveRefund(
    @Param('refundId', ParseIntPipe) refundId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.approveRefund(refundId, user.id);
  }

  // 환불 요청 거절
  @Put('refunds/:refundId/reject')
  async rejectRefund(
    @Param('refundId', ParseIntPipe) refundId: number,
    @Body() rejectData: { reason: string; detailedReason?: string },
    @GetUser() user: any,
  ) {
    return this.principalService.rejectRefund(refundId, rejectData, user.id);
  }

  // === 선생님/수강생 관리 API ===

  // 선생님을 학원에서 제거
  @Delete('teachers/:teacherId')
  async removeTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.removeTeacher(teacherId, user.id);
  }

  // 수강생을 학원에서 제거
  @Delete('students/:studentId')
  async removeStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.removeStudent(studentId, user.id);
  }

  // 수강생의 세션 수강 현황 조회
  @Get('students/:studentId/sessions')
  async getStudentSessionHistory(
    @Param('studentId', ParseIntPipe) studentId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getStudentSessionHistory(studentId, user.id);
  }

  // 선생님 가입 신청 목록 조회
  @Get('teacher-join-requests')
  @ApiOperation({ summary: '선생님 가입 신청 목록 조회' })
  @ApiResponse({ status: 200, description: '가입 신청 목록 조회 성공' })
  async getTeacherJoinRequests(@GetUser() user: any) {
    return this.principalService.getTeacherJoinRequestsByUserId(user.id);
  }

  // 선생님 가입 신청 승인
  @Post('teacher-join-requests/:requestId/approve')
  @ApiOperation({ summary: '선생님 가입 신청 승인' })
  @ApiResponse({ status: 200, description: '가입 신청 승인 성공' })
  async approveTeacherJoinRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.approveTeacherJoinRequestByUserId(
      requestId,
      user.id,
    );
  }

  // 선생님 가입 신청 거절
  @Post('teacher-join-requests/:requestId/reject')
  @ApiOperation({ summary: '선생님 가입 신청 거절' })
  @ApiResponse({ status: 200, description: '가입 신청 거절 성공' })
  async rejectTeacherJoinRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @GetUser() user: any,
    @Body() body: { reason?: string },
  ) {
    return this.principalService.rejectTeacherJoinRequestByUserId(
      requestId,
      user.id,
      body.reason,
    );
  }

  // 필터링된 수강신청 목록 조회
  @Get('enrollments')
  @ApiOperation({ summary: '필터링된 수강신청 목록 조회' })
  @ApiResponse({ status: 200, description: '수강신청 목록 조회 성공' })
  async getFilteredEnrollments(@GetUser() user: any) {
    return this.principalService.getFilteredEnrollments(user.id);
  }

  // 필터링된 환불요청 목록 조회
  @Get('refunds')
  @ApiOperation({ summary: '필터링된 환불요청 목록 조회' })
  @ApiResponse({ status: 200, description: '환불요청 목록 조회 성공' })
  async getFilteredRefundRequests(@GetUser() user: any) {
    return this.principalService.getFilteredRefundRequests(user.id);
  }
}

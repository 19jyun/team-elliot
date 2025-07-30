import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeacherService } from './teacher.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { multerConfig } from '../config/multer.config';
import { Role } from '@prisma/client';
import { CreateClassDto } from '../admin/dto/create-class.dto';
import { CreateAcademyDto } from '../academy/dto/create-academy.dto';
import { UpdateAcademyDto } from '../academy/dto/update-academy.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('me/classes')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: 'Principal이 선생님을 지정하여 클래스 생성' })
  @ApiResponse({ status: 201, description: '클래스 생성 성공' })
  async createClass(
    @GetUser() user: any,
    @Body() createClassDto: CreateClassDto,
  ) {
    // Principal만 강의 개설 가능
    return this.teacherService.createClass(user.id, createClassDto, user.role);
  }

  @Get('me')
  @Roles(Role.TEACHER)
  async getMyProfile(@GetUser() user: any) {
    return this.teacherService.getTeacherProfile(user.id);
  }

  @Put('me/profile')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async updateMyProfile(
    @GetUser() user: any,
    @Body() updateData: any,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    // JSON 문자열로 전송된 배열 필드들을 파싱
    const parsedData = {
      name: updateData.name,
      phoneNumber: updateData.phoneNumber,
      introduction: updateData.introduction,
      education: updateData.education
        ? JSON.parse(updateData.education)
        : undefined,
      specialties: updateData.specialties
        ? JSON.parse(updateData.specialties)
        : undefined,
      certifications: updateData.certifications
        ? JSON.parse(updateData.certifications)
        : undefined,
      yearsOfExperience: updateData.yearsOfExperience
        ? parseInt(updateData.yearsOfExperience)
        : undefined,
      availableTimes: updateData.availableTimes
        ? JSON.parse(updateData.availableTimes)
        : undefined,
    };

    return this.teacherService.updateProfile(user.id, parsedData, photo);
  }

  @Get('me/classes')
  @Roles(Role.TEACHER)
  async getMyClasses(@GetUser() user: any) {
    return this.teacherService.getTeacherClasses(user.id);
  }

  @Get('me/classes-with-sessions')
  @Roles(Role.TEACHER)
  async getMyClassesWithSessions(@GetUser() user: any) {
    return this.teacherService.getTeacherClassesWithSessions(user.id);
  }

  // 선생님의 현재 학원 정보 조회
  @Get('me/academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '내 학원 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '현재 소속된 학원 정보를 반환합니다.',
  })
  async getMyAcademy(@GetUser() user: any) {
    return this.teacherService.getMyAcademy(user.id);
  }

  // 선생님의 학원 변경
  @Post('me/change-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 변경' })
  @ApiResponse({ status: 200, description: '학원 변경이 완료되었습니다.' })
  async changeAcademy(@GetUser() user: any, @Body() body: { code: string }) {
    return this.teacherService.changeAcademy(user.id, body.code);
  }

  // 선생님이 새 학원 생성
  @Post('me/create-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '새 학원 생성' })
  @ApiResponse({ status: 201, description: '새 학원이 생성되었습니다.' })
  async createAcademy(
    @GetUser() user: any,
    @Body() createAcademyDto: CreateAcademyDto,
  ) {
    return this.teacherService.createAcademy(createAcademyDto, user.id);
  }

  // 학원 정보 수정 (관리자만)
  @Put('me/academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 정보 수정 (관리자만)' })
  @ApiResponse({ status: 200, description: '학원 정보가 수정되었습니다.' })
  async updateAcademy(
    @GetUser() user: any,
    @Body() updateAcademyDto: UpdateAcademyDto,
  ) {
    return this.teacherService.updateAcademy(user.id, updateAcademyDto);
  }

  // 학원 탈퇴 (관리자 불가)
  @Post('me/leave-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 탈퇴' })
  @ApiResponse({ status: 200, description: '학원 탈퇴가 완료되었습니다.' })
  async leaveAcademy(@GetUser() user: any) {
    return this.teacherService.leaveAcademy(user.id);
  }

  // 선생님이 새 학원을 생성하고 자동으로 소속되기
  @Post('me/create-and-join-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '새 학원 생성 및 자동 소속' })
  @ApiResponse({
    status: 201,
    description: '새 학원이 생성되고 자동으로 소속되었습니다.',
  })
  async createAndJoinAcademy(
    @GetUser() user: any,
    @Body() createAcademyDto: CreateAcademyDto,
  ) {
    return this.teacherService.createAndJoinAcademy(user.id, createAcademyDto);
  }

  // 관리자용 API들 (기존 유지)
  @Get(':id')
  @Roles(Role.ADMIN)
  async getTeacherProfile(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherProfile(id);
  }

  // 학생/선생님/관리자 모두 접근 가능한 공개 프로필 API
  @Get(':id/profile')
  @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: '선생님 공개 프로필 조회' })
  @ApiResponse({ status: 200, description: '선생님 프로필 조회 성공' })
  async getPublicTeacherProfile(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherProfile(id);
  }

  @Put(':id/profile')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.teacherService.updateProfile(id, updateData, photo);
  }

  @Get(':id/classes')
  @Roles(Role.ADMIN)
  async getTeacherClasses(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherClasses(id);
  }

  @Get(':id/classes-with-sessions')
  @Roles(Role.ADMIN)
  async getTeacherClassesWithSessions(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherClassesWithSessions(id);
  }

  // 수강 신청/환불 신청 관리 관련 엔드포인트들
  @Get('me/sessions-with-enrollment-requests')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '수강 신청이 대기 중인 세션 목록 조회' })
  @ApiResponse({ status: 200, description: '수강 신청 대기 세션 목록' })
  async getSessionsWithEnrollmentRequests(@GetUser() user: any) {
    return this.teacherService.getSessionsWithEnrollmentRequests(user.id);
  }

  @Get('me/sessions-with-refund-requests')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '환불 요청이 대기 중인 세션 목록 조회' })
  @ApiResponse({ status: 200, description: '환불 요청 대기 세션 목록' })
  async getSessionsWithRefundRequests(@GetUser() user: any) {
    return this.teacherService.getSessionsWithRefundRequests(user.id);
  }

  // === 학원 관리 API들 ===

  // 1. 특정 선생님을 학원에서 제거
  @Delete('academy/teachers/:teacherId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '선생님을 학원에서 제거' })
  @ApiResponse({
    status: 200,
    description: '선생님이 학원에서 제거되었습니다.',
  })
  async removeTeacherFromAcademy(
    @GetUser() user: any,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.teacherService.removeTeacherFromAcademy(user.id, teacherId);
  }

  // 2. 관리자 권한 부여
  @Post('academy/teachers/:teacherId/assign-admin')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '선생님에게 관리자 권한 부여' })
  @ApiResponse({ status: 200, description: '관리자 권한이 부여되었습니다.' })
  async assignAdminRole(
    @GetUser() user: any,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.teacherService.assignAdminRole(user.id, teacherId);
  }

  // 3. 관리자 권한 제거
  @Delete('academy/teachers/:teacherId/remove-admin')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '선생님의 관리자 권한 제거' })
  @ApiResponse({ status: 200, description: '관리자 권한이 제거되었습니다.' })
  async removeAdminRole(
    @GetUser() user: any,
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.teacherService.removeAdminRole(user.id, teacherId);
  }

  // 4. 수강생의 세션 수강 현황 조회
  @Get('academy/students/:studentId/sessions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '수강생의 세션 수강 현황 조회' })
  @ApiResponse({ status: 200, description: '수강생의 세션 수강 현황' })
  async getStudentSessionHistory(
    @GetUser() user: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.teacherService.getStudentSessionHistory(user.id, studentId);
  }

  // 5. 선생님 지정하여 강의 개설
  @Post('academy/classes/with-teacher')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: 'Principal이 특정 선생님을 지정하여 강의 개설' })
  @ApiResponse({
    status: 201,
    description: '강의가 성공적으로 개설되었습니다.',
  })
  async createClassWithTeacher(
    @GetUser() user: any,
    @Body() body: { classData: CreateClassDto; assignedTeacherId: number },
  ) {
    return this.teacherService.createClassWithTeacher(
      user.id,
      body.classData,
      body.assignedTeacherId,
    );
  }

  // 6. 학원 소속 선생님 목록 조회
  @Get('academy/teachers')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: 'Principal이 학원 소속 선생님 목록 조회' })
  @ApiResponse({ status: 200, description: '학원 소속 선생님 목록' })
  async getAcademyTeachers(@GetUser() user: any) {
    return this.teacherService.getAcademyTeachersForPrincipal(user.id);
  }

  // 7. 학원 소속 수강생 목록 조회
  @Get('academy/students')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 소속 수강생 목록 조회' })
  @ApiResponse({ status: 200, description: '학원 소속 수강생 목록' })
  async getAcademyStudents(@GetUser() user: any) {
    return this.teacherService.getAcademyStudents(user.id);
  }
}

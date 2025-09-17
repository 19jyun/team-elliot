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
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';

@ApiTags('Student')
@Controller('student')
@UseGuards(JwtAuthGuard)
@ApiSecurity('JWT-auth')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('classes')
  @ApiOperation({ summary: '내 수강 클래스 목록 조회' })
  @ApiResponse({ status: 200, description: '수강 클래스 목록 조회 성공' })
  @ApiUnauthorizedResponse({ description: '인증 실패 - 유효하지 않은 토큰' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getMyClasses(@CurrentUser() user: any) {
    return this.studentService.getStudentClasses(user.id);
  }

  @Get('classes/:id')
  @ApiOperation({ summary: '클래스 상세 정보 조회' })
  @ApiParam({ name: 'id', description: '클래스 ID', type: 'string' })
  @ApiResponse({ status: 200, description: '클래스 상세 정보 조회 성공' })
  @ApiBadRequestResponse({
    description: '잘못된 요청 - 유효하지 않은 클래스 ID',
  })
  @ApiNotFoundResponse({ description: '클래스를 찾을 수 없음' })
  @ApiUnauthorizedResponse({ description: '인증 실패 - 유효하지 않은 토큰' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getClassDetail(@Param('id') id: string) {
    return this.studentService.getClassDetail(Number(id));
  }

  @Post('classes/:id/enroll')
  @ApiOperation({ summary: '클래스 수강 신청' })
  @ApiParam({ name: 'id', description: '클래스 ID', type: 'string' })
  @ApiResponse({ status: 201, description: '수강 신청 성공' })
  @ApiBadRequestResponse({
    description: '잘못된 요청 - 이미 수강 중이거나 수강 불가능한 상태',
  })
  @ApiNotFoundResponse({ description: '클래스를 찾을 수 없음' })
  @ApiUnauthorizedResponse({ description: '인증 실패 - 유효하지 않은 토큰' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async enrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.enrollClass(Number(classId), user.id);
  }

  @Delete('classes/:id/enroll')
  @ApiOperation({ summary: '클래스 수강 취소' })
  @ApiParam({ name: 'id', description: '클래스 ID', type: 'string' })
  @ApiResponse({ status: 200, description: '수강 취소 성공' })
  @ApiBadRequestResponse({ description: '잘못된 요청 - 수강하지 않은 클래스' })
  @ApiNotFoundResponse({ description: '클래스를 찾을 수 없음' })
  @ApiUnauthorizedResponse({ description: '인증 실패 - 유효하지 않은 토큰' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async unenrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.unenrollClass(Number(classId), user.id);
  }

  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  @ApiUnauthorizedResponse({ description: '인증 실패 - 유효하지 않은 토큰' })
  @ApiInternalServerErrorResponse({ description: '서버 내부 오류' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.studentService.getMyProfile(user.id);
  }

  @Get('teachers/:teacherId/profile')
  @ApiOperation({ summary: '선생님 프로필 조회 (학생용)' })
  @ApiResponse({ status: 200, description: '선생님 프로필 조회 성공' })
  async getTeacherProfile(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.studentService.getTeacherProfile(teacherId);
  }

  @Put('profile')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.studentService.updateMyProfile(user.id, updateProfileDto);
  }

  @Get('enrollment-history')
  async getEnrollmentHistory(@CurrentUser() user: any) {
    return this.studentService.getEnrollmentHistory(user.id);
  }

  @Get('cancellation-history')
  async getCancellationHistory(@CurrentUser() user: any) {
    return this.studentService.getCancellationHistory(user.id);
  }

  // 세션별 입금 정보 조회 (결제 시 사용)
  @Get('sessions/:sessionId/payment-info')
  @ApiOperation({ summary: '세션별 입금 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '세션의 입금 정보를 반환합니다.',
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
  @ApiOperation({ summary: '수강생을 학원에서 제거' })
  @ApiResponse({
    status: 200,
    description: '수강생이 학원에서 제거되었습니다.',
  })
  async removeStudentFromAcademy(
    @CurrentUser() user: any,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.studentService.removeStudentFromAcademy(user.id, studentId);
  }
}

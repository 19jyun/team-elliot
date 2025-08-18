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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Student')
@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('classes')
  async getMyClasses(@CurrentUser() user: any) {
    return this.studentService.getStudentClasses(user.id);
  }

  @Get('classes/:id')
  async getClassDetail(@Param('id') id: string) {
    return this.studentService.getClassDetail(Number(id));
  }

  @Post('classes/:id/enroll')
  async enrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.enrollClass(Number(classId), user.id);
  }

  @Delete('classes/:id/enroll')
  async unenrollClass(@Param('id') classId: string, @CurrentUser() user: any) {
    return this.studentService.unenrollClass(Number(classId), user.id);
  }

  @Get('profile')
  async getMyProfile(@CurrentUser() user: any) {
    return this.studentService.getMyProfile(user.id);
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

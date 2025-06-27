import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateStudentDto,
  CreateTeacherDto,
  CreateClassDto,
  ResetPasswordDto,
  WithdrawalStatsDto,
} from './dto';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { TeacherEntity, StudentEntity, ClassEntity } from './entities'; // Assumes these are defined for response types

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('students')
  @ApiOperation({ summary: '전체 수강생 목록 조회' })
  @ApiOkResponse({ description: '전체 수강생 반환', type: [StudentEntity] })
  getStudents() {
    return this.adminService.getStudents();
  }

  @Get('teachers')
  @ApiOperation({ summary: '전체 선생님 목록 조회' })
  @ApiOkResponse({ description: '전체 선생님 반환', type: [TeacherEntity] })
  getTeachers() {
    return this.adminService.getTeachers();
  }

  @Get('classes')
  @ApiOperation({ summary: '전체 수업 목록 조회' })
  @ApiOkResponse({ description: '전체 수업 반환', type: [ClassEntity] })
  getClasses() {
    return this.adminService.getClasses();
  }

  @Get('withdrawal-stats')
  @ApiOperation({ summary: '수강생 탈퇴 통계 조회' })
  @ApiOkResponse({ description: '탈퇴 통계 반환', type: WithdrawalStatsDto })
  async getWithdrawalStats() {
    return this.adminService.getWithdrawalStats();
  }

  @Post('students')
  @ApiOperation({ summary: '수강생 생성' })
  @ApiBody({ type: CreateStudentDto })
  @ApiCreatedResponse({
    description: '생성된 수강생 반환',
    type: StudentEntity,
  })
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.adminService.createStudent(createStudentDto);
  }

  @Post('teachers')
  @ApiOperation({ summary: '선생님 생성' })
  @ApiBody({ type: CreateTeacherDto })
  @ApiCreatedResponse({
    description: '생성된 선생님 반환',
    type: TeacherEntity,
  })
  async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.adminService.createTeacher(createTeacherDto);
  }

  @Post('classes')
  @ApiOperation({ summary: '수업 생성' })
  @ApiBody({ type: CreateClassDto })
  @ApiCreatedResponse({ description: '생성된 수업 반환', type: ClassEntity })
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.adminService.createClass(createClassDto);
  }

  @Delete('students/:id')
  @ApiOperation({ summary: '수강생 삭제' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: '수강생 삭제 완료' })
  deleteStudent(@Param('id') id: string) {
    return this.adminService.deleteStudent(+id);
  }

  @Delete('teachers/:id')
  @ApiOperation({ summary: '선생님 삭제' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: '선생님 삭제 완료' })
  deleteTeacher(@Param('id') id: string) {
    return this.adminService.deleteTeacher(+id);
  }

  @Delete('classes/:id')
  @ApiOperation({ summary: '수업 삭제' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: '수업 삭제 완료' })
  deleteClass(@Param('id') id: string) {
    return this.adminService.deleteClass(+id);
  }

  @Post('students/:id/reset-password')
  @ApiOperation({ summary: '수강생 비밀번호 초기화' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: '비밀번호 초기화 성공', type: StudentEntity })
  async resetStudentPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.adminService.resetStudentPassword(Number(id), dto.newPassword);
  }
}

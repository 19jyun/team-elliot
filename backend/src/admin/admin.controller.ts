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
import { CreateStudentDto, CreateTeacherDto, CreateClassDto } from './dto';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('students')
  getStudents() {
    return this.adminService.getStudents();
  }

  @Get('teachers')
  getTeachers() {
    return this.adminService.getTeachers();
  }

  @Get('classes')
  getClasses() {
    return this.adminService.getClasses();
  }

  @Get('withdrawal-stats')
  async getWithdrawalStats() {
    return this.adminService.getWithdrawalStats();
  }

  @Post('students')
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.adminService.createStudent(createStudentDto);
  }

  @Post('teachers')
  async createTeacher(@Body() createTeacherDto: CreateTeacherDto) {
    return this.adminService.createTeacher(createTeacherDto);
  }

  @Post('classes')
  async createClass(@Body() createClassDto: CreateClassDto) {
    return this.adminService.createClass(createClassDto);
  }

  @Delete('students/:id')
  deleteStudent(@Param('id') id: string) {
    return this.adminService.deleteStudent(+id);
  }

  @Delete('teachers/:id')
  deleteTeacher(@Param('id') id: string) {
    return this.adminService.deleteTeacher(+id);
  }

  @Delete('classes/:id')
  deleteClass(@Param('id') id: string) {
    return this.adminService.deleteClass(+id);
  }

  @Post('students/:id/reset-password')
  async resetStudentPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.adminService.resetStudentPassword(Number(id), body.newPassword);
  }
}

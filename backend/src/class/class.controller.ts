import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClassDto } from '../types/class.types';
import { UpdateClassStatusDto } from './dto/update-class-status.dto';
import { Role } from '@prisma/client';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('academy/me')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '내 학원의 강의 목록 조회 (상태 필터링)' })
  @ApiResponse({
    status: 200,
    description: '학원의 강의 목록을 반환합니다.',
  })
  async getAcademyClasses(
    @CurrentUser() user: any,
    @Query('status') status?: 'DRAFT' | 'ACTIVE',
  ) {
    if (!user?.academyId) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    if (status === 'DRAFT') {
      return this.classService.getDraftClasses(user.academyId);
    }

    if (status === 'ACTIVE') {
      return this.classService.getActiveClasses(user.academyId);
    }

    return this.classService.getAllAcademyClasses(user.id);
  }

  @Get()
  @ApiOperation({ summary: '클래스 목록 조회 (검색/필터)' })
  @ApiResponse({ status: 200, description: '클래스 목록을 반환합니다.' })
  async getClasses(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('includeSessions') includeSessions?: string,
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('teacherId') teacherId?: string,
    @CurrentUser() user?: any,
  ) {
    if (year && month) {
      const parsedYear = parseInt(year, 10);
      const shouldIncludeSessions =
        typeof includeSessions === 'string'
          ? includeSessions.toLowerCase() === 'true'
          : false;

      if (shouldIncludeSessions) {
        const studentId = user?.role === 'STUDENT' ? user.id : undefined;
        return this.classService.getClassesWithSessionsByMonth(
          month,
          parsedYear,
          studentId,
        );
      }

      return this.classService.getClassesByMonth(month, parsedYear);
    }

    return this.classService.getAllClasses({
      dayOfWeek,
      teacherId: teacherId ? parseInt(teacherId, 10) : undefined,
    });
  }

  @Post()
  @Roles(Role.PRINCIPAL)
  async createClass(@Body() data: CreateClassDto, @CurrentUser() user: any) {
    return this.classService.createClass(data, user.id);
  }

  @Get(':id')
  async getClassDetails(@Param('id', ParseIntPipe) id: number) {
    return this.classService.getClassDetails(id);
  }

  @Put(':id')
  @Roles(Role.PRINCIPAL)
  async updateClass(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.classService.updateClass(id, data);
  }

  @Put(':id/details')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '클래스 상세 정보 수정' })
  @ApiResponse({ status: 200, description: '클래스 상세 정보 수정 성공' })
  async updateClassDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      description?: string;
      locationName?: string;
      mapImageUrl?: string;
      requiredItems?: string[];
      curriculum?: string[];
    },
    @CurrentUser() user: any,
  ) {
    return this.classService.updateClassDetails(id, data, user.id);
  }

  @Delete(':id')
  @Roles(Role.PRINCIPAL)
  async deleteClass(@Param('id', ParseIntPipe) id: number) {
    return this.classService.deleteClass(id);
  }

  @Patch(':id')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '강의 정보 수정 (상태 변경 포함)' })
  @ApiResponse({ status: 200, description: '강의 정보 수정 성공' })
  async updateClassStatus(
    @Param('id', ParseIntPipe) classId: number,
    @Body() updateStatusDto: UpdateClassStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.classService.updateClassStatus(
      classId,
      user.id,
      updateStatusDto.status,
      updateStatusDto.reason,
    );
  }

  @Post(':id/enrollments')
  @Roles(Role.STUDENT)
  async createEnrollment(
    @Param('id', ParseIntPipe) classId: number,
    @Body('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.classService.enrollStudent(classId, studentId);
  }

  @Delete(':id/enroll')
  @Roles(Role.STUDENT)
  async unenrollClass(
    @Param('id', ParseIntPipe) classId: number,
    @Body('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.classService.unenrollStudent(classId, studentId);
  }

  @Post(':id/session-generation-jobs')
  @Roles(Role.PRINCIPAL)
  async createSessionGenerationJob(@Param('id', ParseIntPipe) classId: number) {
    return this.classService.generateSessionsForExistingClass(classId);
  }

  @Post(':id/session-generation-jobs/period')
  @Roles(Role.PRINCIPAL)
  async generateSessionsForPeriod(
    @Param('id', ParseIntPipe) classId: number,
    @Body() data: { startDate: string; endDate: string },
  ) {
    return this.classService.generateSessionsForPeriod(
      classId,
      new Date(data.startDate),
      new Date(data.endDate),
    );
  }
}

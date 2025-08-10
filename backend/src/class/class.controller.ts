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
import { ClassService } from './class.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClassDto } from '../types/class.types';
import { UpdateClassStatusDto } from './dto/update-class-status.dto';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get(':id/details')
  async getClassDetails(@Param('id', ParseIntPipe) id: number) {
    return this.classService.getClassDetails(id);
  }

  @Get()
  async getAllClasses(
    @Query('dayOfWeek') dayOfWeek?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.classService.getAllClasses({
      dayOfWeek,
      teacherId: teacherId ? parseInt(teacherId) : undefined,
    });
  }

  @Post()
  @Roles(Role.PRINCIPAL)
  async createClass(@Body() data: CreateClassDto) {
    // DTO에서 이미 UTC ISO 문자열로 변환된 데이터를 그대로 사용
    return this.classService.createClass(data);
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

  @Put(':id/status')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '강의 상태 변경 (승인/거절)' })
  @ApiResponse({ status: 200, description: '강의 상태 변경 성공' })
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

  @Get('academy/draft')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '학원의 DRAFT 상태 강의 목록 조회' })
  @ApiResponse({ status: 200, description: 'DRAFT 상태 강의 목록 조회 성공' })
  async getDraftClasses(@CurrentUser() user: any) {
    // 사용자의 학원 정보 조회
    const teacher = await this.classService['prisma'].teacher.findUnique({
      where: { id: user.id },
      select: { academyId: true },
    });

    if (!teacher?.academyId) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    return this.classService.getDraftClasses(teacher.academyId);
  }

  @Get('academy/active')
  @Roles(Role.PRINCIPAL)
  @ApiOperation({ summary: '학원의 활성 강의 목록 조회' })
  @ApiResponse({ status: 200, description: '활성 강의 목록 조회 성공' })
  async getActiveClasses(@CurrentUser() user: any) {
    // 사용자의 학원 정보 조회
    const teacher = await this.classService['prisma'].teacher.findUnique({
      where: { id: user.id },
      select: { academyId: true },
    });

    if (!teacher?.academyId) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    return this.classService.getActiveClasses(teacher.academyId);
  }

  @Post(':id/enroll')
  @Roles(Role.STUDENT)
  async enrollClass(
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

  @Get('month/:month')
  async getClassesByMonth(
    @Param('month') month: string,
    @Query('year') year: string,
  ) {
    return this.classService.getClassesByMonth(month, parseInt(year));
  }

  @Get('sessions/:month')
  @ApiOperation({ summary: '해당 월에 세션이 있는 클래스들과 세션 정보 조회' })
  @ApiResponse({ status: 200, description: '클래스와 세션 정보 조회 성공' })
  async getClassesWithSessionsByMonth(
    @Param('month') month: string,
    @Query('year') year: string,
    @CurrentUser() user: any,
  ) {
    return this.classService.getClassesWithSessionsByMonth(
      month,
      parseInt(year),
      user.role === 'STUDENT' ? user.id : undefined,
    );
  }

  @Post(':id/generate-sessions')
  @Roles(Role.PRINCIPAL)
  async generateSessionsForClass(@Param('id', ParseIntPipe) classId: number) {
    return this.classService.generateSessionsForExistingClass(classId);
  }

  @Post(':id/generate-sessions/period')
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

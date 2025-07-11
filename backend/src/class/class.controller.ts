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
import { ClassService } from './class.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateClassDto } from '../admin/dto/create-class.dto';
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
  @Roles(Role.ADMIN)
  async createClass(@Body() data: CreateClassDto) {
    // DTO에서 이미 UTC ISO 문자열로 변환된 데이터를 그대로 사용
    return this.classService.createClass(data);
  }

  @Put(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  async updateClass(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.classService.updateClass(id, data);
  }

  @Put(':id/details')
  @Roles(Role.TEACHER, Role.ADMIN)
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
  @Roles(Role.ADMIN)
  async deleteClass(@Param('id', ParseIntPipe) id: number) {
    return this.classService.deleteClass(id);
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
  @Roles(Role.STUDENT, Role.ADMIN)
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

  @Post(':id/generate-sessions')
  @Roles(Role.ADMIN, Role.TEACHER)
  async generateSessionsForClass(@Param('id', ParseIntPipe) classId: number) {
    return this.classService.generateSessionsForExistingClass(classId);
  }

  @Post(':id/generate-sessions/period')
  @Roles(Role.ADMIN, Role.TEACHER)
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

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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('me/classes')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '선생님 클래스 생성' })
  @ApiResponse({ status: 201, description: '클래스 생성 성공' })
  async createClass(
    @GetUser() user: any,
    @Body() createClassDto: CreateClassDto,
  ) {
    // teacherId가 요청에 포함되어 있지만, 보안을 위해 현재 로그인한 사용자의 ID로 덮어쓰기
    createClassDto.teacherId = user.id;
    return this.teacherService.createClass(user.id, createClassDto);
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
    @Body() updateData: { introduction?: string },
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.teacherService.updateProfile(user.id, updateData, photo);
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

  // 관리자용 API들 (기존 유지)
  @Get(':id')
  @Roles(Role.ADMIN)
  async getTeacherProfile(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getTeacherProfile(id);
  }

  @Put(':id/profile')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('photo', multerConfig))
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { introduction?: string },
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
}

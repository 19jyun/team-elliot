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
import { CreateAcademyDto } from '../academy/dto/create-academy.dto';
import { UpdateAcademyDto } from '../academy/dto/update-academy.dto';
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
}

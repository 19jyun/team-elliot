import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeacherService } from './teacher.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { teacherProfileConfig } from '../config/multer.config';
import { Role } from '@prisma/client';
// import { CreateAcademyDto } from '../academy/dto/create-academy.dto';
// import { UpdateAcademyDto } from '../academy/dto/update-academy.dto';
import { JoinAcademyRequestDto } from '../academy/dto/join-academy-request.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Teacher')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('me/request-join-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 가입 요청' })
  @ApiResponse({ status: 201, description: '가입 요청 성공' })
  async requestJoinAcademy(
    @GetUser() user: any,
    @Body() joinAcademyRequestDto: JoinAcademyRequestDto,
  ) {
    return this.teacherService.requestJoinAcademy(
      user.id,
      joinAcademyRequestDto,
    );
  }

  @Get('me')
  @Roles(Role.TEACHER)
  async getMyProfile(@GetUser() user: any) {
    return this.teacherService.getTeacherProfile(user.id);
  }

  @Put('me/profile')
  @Roles(Role.TEACHER)
  async updateMyProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.teacherService.updateProfile(user.id, updateProfileDto);
  }

  @Put('me/profile/photo')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('photo', teacherProfileConfig))
  async updateMyProfilePhoto(
    @GetUser() user: any,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.teacherService.updateProfilePhoto(user.id, photo);
  }

  @Get('me/data')
  @Roles(Role.TEACHER)
  async getTeacherData(@GetUser() user: any) {
    return this.teacherService.getTeacherData(user.id);
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

  // 학원 탈퇴 (관리자 불가)
  @Post('me/leave-academy')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 탈퇴' })
  @ApiResponse({ status: 200, description: '학원 탈퇴가 완료되었습니다.' })
  async leaveAcademy(@GetUser() user: any) {
    return this.teacherService.leaveAcademy(user.id);
  }

  // 선생님의 학원 가입 상태 조회
  @Get('me/academy-status')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '학원 가입 상태 조회' })
  @ApiResponse({
    status: 200,
    description: '학원 가입 상태를 반환합니다.',
  })
  async getAcademyStatus(@GetUser() user: any) {
    return this.teacherService.getTeacherAcademyStatus(user.id);
  }
}

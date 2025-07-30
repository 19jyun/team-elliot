import {
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { PrincipalService } from './principal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import { UpdateAcademyDto } from './dto/update-academy.dto';

@Controller('principal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PRINCIPAL)
export class PrincipalController {
  constructor(private readonly principalService: PrincipalService) {}

  // Principal의 학원 정보 조회
  @Get('academy')
  async getMyAcademy(@GetUser() user: any) {
    return this.principalService.getMyAcademy(user.id);
  }

  // Principal의 학원 모든 세션 조회
  @Get('sessions')
  async getAllSessions(@GetUser() user: any) {
    return this.principalService.getAllSessions(user.id);
  }

  // Principal의 학원 모든 클래스 조회
  @Get('classes')
  async getAllClasses(@GetUser() user: any) {
    return this.principalService.getAllClasses(user.id);
  }

  // Principal의 학원 모든 강사 조회
  @Get('teachers')
  async getAllTeachers(@GetUser() user: any) {
    return this.principalService.getAllTeachers(user.id);
  }

  // Principal의 학원 모든 학생 조회
  @Get('students')
  async getAllStudents(@GetUser() user: any) {
    return this.principalService.getAllStudents(user.id);
  }

  // Principal 정보 조회
  @Get('profile')
  async getPrincipalInfo(@GetUser() user: any) {
    return this.principalService.getPrincipalInfo(user.id);
  }

  // Principal의 세션 수강생 조회
  @Get('sessions/:sessionId/enrollments')
  async getSessionEnrollments(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @GetUser() user: any,
  ) {
    return this.principalService.getSessionEnrollments(sessionId, user.id);
  }

  // Principal의 학원 정보 수정
  @Put('academy')
  async updateAcademy(
    @GetUser() user: any,
    @Body() updateAcademyDto: UpdateAcademyDto,
  ) {
    return this.principalService.updateAcademy(user.id, updateAcademyDto);
  }
}

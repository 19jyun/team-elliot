import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ClassSessionService } from './class-session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('ClassSession')
@Controller('class-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '수업 세션 생성' })
  async createClassSession(
    @Body()
    data: {
      classId: number;
      date: string;
      startTime: string;
      endTime: string;
    },
  ) {
    return this.classSessionService.createClassSession({
      ...data,
      date: new Date(data.date),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });
  }

  @Get('class/:classId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: '클래스별 세션 목록 조회' })
  async getClassSessions(@Param('classId', ParseIntPipe) classId: number) {
    return this.classSessionService.getClassSessions(classId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: '세션 상세 조회' })
  async getClassSession(@Param('id', ParseIntPipe) id: number) {
    return this.classSessionService.getClassSession(id);
  }

  @Post(':sessionId/enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '세션별 수강 신청' })
  async enrollSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.enrollSession(sessionId, user.id);
  }

  @Post('batch-enroll')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '여러 세션 일괄 수강 신청' })
  async batchEnrollSessions(
    @Body() data: { sessionIds: number[] },
    @CurrentUser() user: any,
  ) {
    return this.classSessionService.batchEnrollSessions(
      data.sessionIds,
      user.id,
    );
  }
}

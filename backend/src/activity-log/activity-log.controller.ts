import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogQueryService } from './activity-log-query.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { QueryActivityLogDto } from './dto/query-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
  constructor(
    private readonly activityLogService: ActivityLogService,
    private readonly activityLogQueryService: ActivityLogQueryService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.create(createActivityLogDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async findAll(@Query() query: QueryActivityLogDto, @Request() req) {
    const userId = req.user.id;
    return this.activityLogQueryService.getActivityHistory(userId, query);
  }

  // 수강 신청 내역 조회
  @Get('enrollment-history')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getEnrollmentHistory(
    @Query() query: QueryActivityLogDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityLogQueryService.getEnrollmentHistory(userId, query);
  }

  // 결제 내역 조회
  @Get('payment-history')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getPaymentHistory(@Query() query: QueryActivityLogDto, @Request() req) {
    const userId = req.user.id;
    return this.activityLogQueryService.getPaymentHistory(userId, query);
  }

  // 환불/취소 내역 조회
  @Get('refund-cancellation-history')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getRefundCancellationHistory(
    @Query() query: QueryActivityLogDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityLogQueryService.getRefundCancellationHistory(
      userId,
      query,
    );
  }

  // 출석 내역 조회
  @Get('attendance-history')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getAttendanceHistory(
    @Query() query: QueryActivityLogDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityLogQueryService.getAttendanceHistory(userId, query);
  }

  // 카테고리별 활동 히스토리 조회
  @Get('category/:category')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getActivityHistoryByCategory(
    @Param('category') category: string,
    @Query() query: QueryActivityLogDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityLogQueryService.getActivityHistoryByCategory(
      userId,
      category,
      query,
    );
  }

  // 특정 세션의 활동 히스토리 조회
  @Get('session/:sessionId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getSessionActivityHistory(
    @Param('sessionId') sessionId: string,
    @Query() query: QueryActivityLogDto,
  ) {
    return this.activityLogQueryService.getSessionActivityHistory(
      parseInt(sessionId),
      query,
    );
  }

  // 개인 활동 통계 조회
  @Get('statistics')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getActivityStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.activityLogQueryService.getActivityStatistics(
      userId,
      startDate,
      endDate,
    );
  }

  // 관리자용 대시보드 데이터 조회
  @Get('admin/dashboard')
  @Roles(Role.ADMIN)
  async getAdminDashboardData(@Query() query: QueryActivityLogDto) {
    return this.activityLogQueryService.getAdminDashboardData(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(+id);
  }
}

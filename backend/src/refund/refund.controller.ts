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
  Request,
} from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundRequestDto } from './dto/refund-request.dto';
import { RefundProcessDto } from './dto/refund-process.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Refund')
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /**
   * 환불 요청 생성
   */
  @Post('request')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '환불 요청 생성' })
  @ApiResponse({ status: 201, description: '환불 요청이 생성되었습니다.' })
  async createRefundRequest(
    @Body() dto: RefundRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.refundService.createRefundRequest(dto, user.id);
  }

  /**
   * 환불 요청 취소
   */
  @Delete('request/:refundRequestId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '환불 요청 취소' })
  @ApiResponse({ status: 200, description: '환불 요청이 취소되었습니다.' })
  async cancelRefundRequest(
    @Param('refundRequestId', ParseIntPipe) refundRequestId: number,
    @CurrentUser() user: any,
  ) {
    return this.refundService.cancelRefundRequest(refundRequestId, user.id);
  }

  /**
   * 학생별 환불 요청 목록 조회
   */
  @Get('student')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '학생별 환불 요청 목록 조회' })
  @ApiResponse({ status: 200, description: '환불 요청 목록을 반환합니다.' })
  async getStudentRefundRequests(@CurrentUser() user: any) {
    return this.refundService.getStudentRefundRequests(user.id);
  }

  /**
   * 전체 환불 요청 목록 조회 (관리자용)
   */
  @Get('all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '전체 환불 요청 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 환불 요청 목록을 반환합니다.',
  })
  async getAllRefundRequests(@Query('status') status?: string) {
    return this.refundService.getAllRefundRequests(status);
  }

  /**
   * 환불 요청 상세 조회
   */
  @Get(':refundRequestId')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: '환불 요청 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '환불 요청 상세 정보를 반환합니다.',
  })
  async getRefundRequest(
    @Param('refundRequestId', ParseIntPipe) refundRequestId: number,
  ) {
    return this.refundService.getRefundRequest(refundRequestId);
  }
}

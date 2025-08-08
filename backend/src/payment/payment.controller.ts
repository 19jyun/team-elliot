import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@ApiTags('Payment')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '결제 생성' })
  @ApiCreatedResponse({ description: '결제가 생성되었습니다.' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Get('session-enrollment/:sessionEnrollmentId')
  @Roles(Role.STUDENT, Role.TEACHER)
  @ApiOperation({ summary: '세션 수강 신청별 결제 정보 조회' })
  @ApiOkResponse({ description: '결제 정보를 반환합니다.' })
  async getPaymentBySessionEnrollment(
    @Param('sessionEnrollmentId', ParseIntPipe) sessionEnrollmentId: number,
  ) {
    return this.paymentService.getPaymentBySessionEnrollment(
      sessionEnrollmentId,
    );
  }

  @Get('student/:studentId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '학생별 결제 내역 조회' })
  @ApiOkResponse({ description: '학생의 결제 내역을 반환합니다.' })
  async getStudentPayments(
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.paymentService.getStudentPayments(studentId);
  }

  @Put('session-enrollment/:sessionEnrollmentId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '결제 정보 업데이트' })
  @ApiOkResponse({ description: '결제 정보가 업데이트되었습니다.' })
  async updatePayment(
    @Param('sessionEnrollmentId', ParseIntPipe) sessionEnrollmentId: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.paymentService.updatePayment(sessionEnrollmentId, dto);
  }

  @Delete('session-enrollment/:sessionEnrollmentId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '결제 삭제' })
  @ApiOkResponse({ description: '결제가 삭제되었습니다.' })
  async deletePayment(
    @Param('sessionEnrollmentId', ParseIntPipe) sessionEnrollmentId: number,
  ) {
    return this.paymentService.deletePayment(sessionEnrollmentId);
  }
}

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  Post,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import { BankingService, BankAccountInfo } from './banking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Controller('banking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('teacher/:teacherId/bank-account')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getTeacherBankAccount(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ): Promise<BankAccountInfo> {
    return this.bankingService.getTeacherBankAccount(teacherId);
  }

  @Get('teacher/:teacherId')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  async getTeacherWithBankAccount(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.bankingService.getTeacherWithBankAccount(teacherId);
  }

  @Post('teacher/:teacherId/bank-account')
  @Roles(Role.ADMIN, Role.TEACHER)
  async createBankAccount(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Body() dto: CreateBankAccountDto,
  ) {
    return this.bankingService.createBankAccount({ ...dto, teacherId });
  }

  @Put('teacher/:teacherId/bank-account')
  @Roles(Role.ADMIN, Role.TEACHER)
  async updateBankAccount(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Body() dto: UpdateBankAccountDto,
  ) {
    return this.bankingService.updateBankAccount(teacherId, dto);
  }

  @Delete('teacher/:teacherId/bank-account')
  @Roles(Role.ADMIN, Role.TEACHER)
  async deleteBankAccount(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.bankingService.deleteBankAccount(teacherId);
  }
}

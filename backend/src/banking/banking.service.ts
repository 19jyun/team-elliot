import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

export interface BankAccountInfo {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  teacherId: number;
}

@Injectable()
export class BankingService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeacherBankAccount(teacherId: number): Promise<BankAccountInfo> {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: {
        teacherId: teacherId,
      },
      select: {
        id: true,
        bankName: true,
        accountNumber: true,
        accountHolder: true,
        teacherId: true,
      },
    });

    if (!bankAccount) {
      throw new NotFoundException(
        `Teacher with ID ${teacherId} has no bank account information`,
      );
    }

    return bankAccount;
  }

  async getTeacherWithBankAccount(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
      include: {
        bankAccount: {
          select: {
            id: true,
            bankName: true,
            accountNumber: true,
            accountHolder: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return teacher;
  }

  async createBankAccount(dto: CreateBankAccountDto): Promise<BankAccountInfo> {
    // teacherId가 이미 계좌를 가지고 있는지 확인
    const exists = await this.prisma.bankAccount.findUnique({
      where: { teacherId: dto.teacherId },
    });
    if (exists) {
      throw new Error('해당 강사는 이미 계좌 정보가 존재합니다.');
    }
    return this.prisma.bankAccount.create({
      data: {
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountHolder: dto.accountHolder,
        teacherId: dto.teacherId,
      },
    });
  }

  async updateBankAccount(
    teacherId: number,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccountInfo> {
    const exists = await this.prisma.bankAccount.findUnique({
      where: { teacherId },
    });
    if (!exists) {
      throw new NotFoundException('계좌 정보가 존재하지 않습니다.');
    }
    return this.prisma.bankAccount.update({
      where: { teacherId },
      data: dto,
    });
  }

  async deleteBankAccount(teacherId: number): Promise<{ deleted: boolean }> {
    const exists = await this.prisma.bankAccount.findUnique({
      where: { teacherId },
    });
    if (!exists) {
      throw new NotFoundException('계좌 정보가 존재하지 않습니다.');
    }
    await this.prisma.bankAccount.delete({ where: { teacherId } });
    return { deleted: true };
  }
}

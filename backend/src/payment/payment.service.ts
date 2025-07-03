import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(dto: CreatePaymentDto) {
    // SessionEnrollment가 존재하는지 확인
    const sessionEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: { id: dto.sessionEnrollmentId },
    });

    if (!sessionEnrollment) {
      throw new NotFoundException('세션 수강 신청을 찾을 수 없습니다.');
    }

    // 이미 결제가 있는지 확인
    const existingPayment = await this.prisma.payment.findUnique({
      where: { sessionEnrollmentId: dto.sessionEnrollmentId },
    });

    if (existingPayment) {
      throw new BadRequestException('이미 결제가 완료된 세션입니다.');
    }

    return this.prisma.payment.create({
      data: {
        sessionEnrollmentId: dto.sessionEnrollmentId,
        studentId: dto.studentId,
        amount: dto.amount,
        status: dto.status || 'PENDING',
        method: dto.method,
        paidAt: dto.paidAt,
      },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
      },
    });
  }

  async getPaymentBySessionEnrollment(sessionEnrollmentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { sessionEnrollmentId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    return payment;
  }

  async getStudentPayments(studentId: number) {
    return this.prisma.payment.findMany({
      where: { studentId },
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
  }

  async updatePayment(sessionEnrollmentId: number, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { sessionEnrollmentId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    return this.prisma.payment.update({
      where: { sessionEnrollmentId },
      data: dto,
      include: {
        sessionEnrollment: {
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        },
        student: true,
      },
    });
  }

  async deletePayment(sessionEnrollmentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { sessionEnrollmentId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    await this.prisma.payment.delete({
      where: { sessionEnrollmentId },
    });

    return { message: '결제가 삭제되었습니다.' };
  }
}

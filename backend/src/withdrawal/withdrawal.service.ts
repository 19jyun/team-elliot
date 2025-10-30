import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { createAnonymizedUser } from './migrator/anonymized-user.migrator';
import { migratePayments } from './migrator/payment-migrator';
import { migrateRefunds } from './migrator/refund-migrator';
import { migrateAttendances } from './migrator/attendance-migrator';
import { migrateSessionEnrollments } from './migrator/session-enrollment-migrator';
import {
  createMaskedUserData,
  createMaskedStudentData,
} from './masker/masking-rules';

/**
 * 회원탈퇴 서비스
 *
 * 학생 회원탈퇴 처리:
 * 1. 법적 보관 의무 데이터를 retention 스키마로 익명화하여 마이그레이션
 * 2. public 스키마의 개인정보를 마스킹하여 무결성 유지
 */
@Injectable()
export class WithdrawalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 학생 회원탈퇴 처리
   */
  async withdrawStudent(userId: number, reason: string): Promise<void> {
    // ============================================================
    // 1단계: 데이터 수집 (트랜잭션 외부)
    // ============================================================
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.role !== 'STUDENT') {
      throw new NotFoundException('학생 정보를 찾을 수 없습니다.');
    }

    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
    });

    if (!student) {
      throw new NotFoundException('학생 정보를 찾을 수 없습니다.');
    }

    // 관련 데이터 조회
    const [payments, refunds, sessionEnrollments, attendances] =
      await Promise.all([
        // Payment 조회 (sessionEnrollment 포함)
        this.prisma.payment.findMany({
          where: { studentId: student.id },
          include: {
            sessionEnrollment: {
              include: {
                session: {
                  include: {
                    class: {
                      select: {
                        academyId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),

        // RefundRequest 조회 (sessionEnrollment, processor 포함)
        this.prisma.refundRequest.findMany({
          where: { studentId: student.id },
          include: {
            sessionEnrollment: {
              include: {
                session: {
                  include: {
                    class: {
                      select: {
                        academyId: true,
                      },
                    },
                  },
                },
              },
            },
            processor: {
              select: {
                role: true,
              },
            },
          },
        }) as any, // 타입 단언 (Prisma가 enrollmentId를 포함하는 타입을 정확히 추론하지 못함)

        // SessionEnrollment 조회 (session 포함)
        this.prisma.sessionEnrollment.findMany({
          where: { studentId: student.id },
          include: {
            session: {
              include: {
                class: {
                  select: {
                    academyId: true,
                  },
                },
              },
            },
          },
        }),

        // Attendance 조회 (class 포함)
        this.prisma.attendance.findMany({
          where: { studentId: student.id },
          include: {
            class: {
              select: {
                academyId: true,
              },
            },
          },
        }),
      ]);

    const withdrawalDate = new Date();

    // ============================================================
    // 2-3단계: 원자적 마이그레이션 및 마스킹 (트랜잭션 내부)
    // ============================================================
    await this.prisma.$transaction(async (tx) => {
      // [1] AnonymizedUser 생성
      const anonymizedUser = await createAnonymizedUser(tx, {
        userRole: 'STUDENT',
        withdrawalDate,
      });

      // [2] AnonymizedSessionEnrollment 생성
      await migrateSessionEnrollments(
        tx,
        sessionEnrollments,
        anonymizedUser.id,
        withdrawalDate,
      );

      // [3] AnonymizedPayment 생성
      await migratePayments(tx, payments, anonymizedUser.id, withdrawalDate);

      // [4] AnonymizedRefund 생성
      await migrateRefunds(
        tx,
        refunds as any, // 타입 단언 (Prisma 타입 추론 한계)
        anonymizedUser.id,
        withdrawalDate,
      );

      // [5] AnonymizedAttendance 생성
      await migrateAttendances(
        tx,
        attendances,
        anonymizedUser.id,
        withdrawalDate,
      );

      // [6] User 테이블 마스킹
      const maskedUserData = createMaskedUserData(userId, user.userId);
      await tx.user.update({
        where: { id: userId },
        data: maskedUserData,
      });

      // [7] Student 테이블 마스킹
      const maskedStudentData = createMaskedStudentData(
        student.id,
        student.userId,
      );
      await tx.student.update({
        where: { id: student.id },
        data: maskedStudentData,
      });

      // [8] WithdrawalHistory 기록
      await tx.withdrawalHistory.create({
        data: {
          userId: user.userId,
          userName: user.name,
          userRole: 'STUDENT',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
    });
  }
}

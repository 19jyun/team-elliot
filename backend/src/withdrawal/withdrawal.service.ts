import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileUtil } from '../common/utils/file.util';
import { createAnonymizedUser } from './migrator/anonymized-user.migrator';
import { migratePayments } from './migrator/payment-migrator';
import { migrateRefunds } from './migrator/refund-migrator';
import { migrateAttendances } from './migrator/attendance-migrator';
import { migrateSessionEnrollments } from './migrator/session-enrollment-migrator';
import { migrateTeacherActivities } from './migrator/teacher-activity.migrator';
import { migratePrincipalActivities } from './migrator/principal-activity.migrator';
import {
  createMaskedUserData,
  createMaskedStudentData,
  createMaskedTeacherData,
  createMaskedPrincipalData,
  createMaskedAcademyData,
} from './masker/masking-rules';

/**
 * 회원탈퇴 서비스
 *
 * 역할별 회원탈퇴 처리:
 * 1. 법적 보관 의무 데이터를 retention 스키마로 익명화하여 마이그레이션
 * 2. public 스키마의 개인정보를 마스킹하여 무결성 유지
 * 3. 관련 엔티티 정리 (Principal: 학원 폐쇄, Teacher: 학원 연결 해제)
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
        }) as any, // 타입 단언 (Prisma 타입 추론 한계)

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
        }) as any, // 타입 단언 (Prisma가 sessionEnrollmentId를 포함한 타입을 정확히 추론하지 못함)
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
      const maskedUserData = createMaskedUserData(userId);
      await tx.user.update({
        where: { id: userId },
        data: maskedUserData,
      });

      // [7] Student 테이블 마스킹
      const maskedStudentData = createMaskedStudentData(student.id);
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

  /**
   * 강사 회원탈퇴 처리
   */
  async withdrawTeacher(userId: number, reason: string): Promise<void> {
    // ============================================================
    // 1단계: 탈퇴 전 검증
    // ============================================================
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
      include: {
        classes: {
          where: {
            endDate: { gte: new Date() }, // ongoing classes
          },
        },
        user: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('강사 정보를 찾을 수 없습니다.');
    }

    // ongoing class 확인
    if (teacher.classes.length > 0) {
      throw new BadRequestException({
        code: 'HAS_ONGOING_CLASSES',
        message: '진행 중인 수업이 있어 탈퇴할 수 없습니다.',
        details: {
          ongoingClassCount: teacher.classes.length,
          classes: teacher.classes.map((c) => ({
            id: c.id,
            name: c.className,
            endDate: c.endDate,
          })),
        },
      });
    }

    // ============================================================
    // 2단계: 데이터 수집 (트랜잭션 외부)
    // ============================================================
    // 모든 Class 운영 이력 (종료된 것 포함)
    const allClasses = await this.prisma.class.findMany({
      where: { teacherId: teacher.id },
      include: {
        classSessions: {
          include: {
            enrollments: {
              include: {
                payment: true,
              },
            },
          },
        },
      },
    });

    const withdrawalDate = new Date();

    // ============================================================
    // 3단계: 트랜잭션 처리
    // ============================================================
    await this.prisma.$transaction(async (tx) => {
      // [1] AnonymizedUser 생성
      const anonymizedUser = await createAnonymizedUser(tx, {
        userRole: 'TEACHER',
        withdrawalDate,
      });

      // [2] AnonymizedTeacherActivity 생성 (CLASS_OPERATION만)
      await migrateTeacherActivities(
        tx,
        {
          classes: allClasses,
        },
        anonymizedUser.id,
        withdrawalDate,
      );

      // [3] 프로필 사진 파일 삭제
      if (teacher.photoUrl) {
        FileUtil.deleteProfilePhoto(teacher.photoUrl);
      }

      // [4] Teacher 테이블 마스킹 및 학원 연결 해제
      const maskedTeacherData = createMaskedTeacherData(teacher.id);
      await tx.teacher.update({
        where: { id: teacher.id },
        data: {
          ...maskedTeacherData,
          academyId: null, // 학원 연결 해제
        },
      });

      // [5] User 테이블 마스킹 (Teacher의 userId 사용)
      await tx.user.update({
        where: { id: userId },
        data: {
          userId: maskedTeacherData.userId,
          password: maskedTeacherData.password,
          name: maskedTeacherData.name,
        },
      });

      // [6] WithdrawalHistory 기록
      await tx.withdrawalHistory.create({
        data: {
          userId: teacher.user.userId,
          userName: teacher.user.name,
          userRole: 'TEACHER',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
    });
  }

  /**
   * 원장 회원탈퇴 처리
   */
  async withdrawPrincipal(userId: number, reason: string): Promise<void> {
    // ============================================================
    // 1단계: 탈퇴 전 검증
    // ============================================================
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: {
        academy: {
          include: {
            classes: {
              where: {
                endDate: { gte: new Date() }, // ongoing classes
              },
            },
            teachers: true,
            students: {
              include: {
                student: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!principal || !principal.academy) {
      throw new NotFoundException('원장 또는 학원 정보를 찾을 수 없습니다.');
    }

    // ongoing class 확인
    if (principal.academy.classes.length > 0) {
      throw new BadRequestException({
        code: 'HAS_ONGOING_CLASSES',
        message: '진행 중인 수업이 있어 탈퇴할 수 없습니다.',
        details: {
          ongoingClassCount: principal.academy.classes.length,
          classes: principal.academy.classes.map((c) => ({
            id: c.id,
            name: c.className,
            endDate: c.endDate,
          })),
        },
      });
    }

    // 처리 대기 중인 환불 요청 확인
    const pendingRefunds = await this.prisma.refundRequest.count({
      where: {
        processedBy: principal.user.id,
        status: 'PENDING',
      },
    });

    if (pendingRefunds > 0) {
      throw new BadRequestException({
        code: 'HAS_PENDING_REFUNDS',
        message: '처리되지 않은 환불 요청이 있어 탈퇴할 수 없습니다.',
        details: { pendingRefundCount: pendingRefunds },
      });
    }

    // 대기 중인 수강 신청 확인 (학원의 모든 세션들)
    const pendingEnrollments = await this.prisma.sessionEnrollment.count({
      where: {
        session: {
          class: {
            academyId: principal.academyId,
          },
        },
        status: 'PENDING',
      },
    });

    if (pendingEnrollments > 0) {
      throw new BadRequestException({
        code: 'HAS_PENDING_ENROLLMENTS',
        message: '처리되지 않은 수강 신청이 있어 탈퇴할 수 없습니다.',
        details: { pendingEnrollmentCount: pendingEnrollments },
      });
    }

    // ============================================================
    // 2단계: 데이터 수집 (트랜잭션 외부)
    // ============================================================
    const [
      allClasses,
      refundProcessHistory,
      rejectionHistory,
      teacherManagementHistory,
    ] = await Promise.all([
      // 학원의 모든 Class 이력
      this.prisma.class.findMany({
        where: { academyId: principal.academyId },
        include: {
          classSessions: {
            include: {
              enrollments: {
                include: {
                  payment: true,
                },
              },
            },
          },
          teacher: true,
        },
      }),

      // 환불 처리 이력
      this.prisma.refundRequest.findMany({
        where: { processedBy: principal.user.id },
        include: {
          sessionEnrollment: {
            include: {
              session: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      }),

      // 거절 이력
      this.prisma.rejectionDetail.findMany({
        where: { rejectedBy: principal.user.id },
      }),

      // 강사 관리 이력
      this.prisma.teacher.findMany({
        where: { academyId: principal.academyId },
        select: {
          id: true,
          createdAt: true,
        },
      }),
    ]);

    const withdrawalDate = new Date();

    // ============================================================
    // 3단계: 트랜잭션 처리
    // ============================================================
    await this.prisma.$transaction(async (tx) => {
      // [1] AnonymizedUser 생성
      const anonymizedUser = await createAnonymizedUser(tx, {
        userRole: 'PRINCIPAL',
        withdrawalDate,
      });

      // [2] AnonymizedPrincipalActivity 생성
      await migratePrincipalActivities(
        tx,
        {
          academy: principal.academy,
          classes: allClasses,
          refundProcessHistory,
          rejectionHistory,
          teacherManagementHistory,
          accountInfo: {
            accountHolder: principal.accountHolder,
            accountNumber: principal.accountNumber,
            bankName: principal.bankName,
          },
        },
        anonymizedUser.id,
        withdrawalDate,
      );

      // [3] 학원에 속한 모든 학생 제거 (StudentAcademy 삭제)
      await tx.studentAcademy.deleteMany({
        where: { academyId: principal.academyId },
      });

      // [4] 학원에 속한 모든 강사 분리 (academyId = null)
      await tx.teacher.updateMany({
        where: { academyId: principal.academyId },
        data: { academyId: null },
      });

      // [5] Academy 마스킹
      await tx.academy.update({
        where: { id: principal.academyId },
        data: createMaskedAcademyData(principal.academyId),
      });

      // [6] 프로필 사진 파일 삭제
      if (principal.photoUrl) {
        FileUtil.deleteProfilePhoto(principal.photoUrl);
      }

      // [7] Principal 테이블 마스킹
      const maskedPrincipalData = createMaskedPrincipalData(principal.id);
      await tx.principal.update({
        where: { id: principal.id },
        data: maskedPrincipalData,
      });

      // [8] User 테이블 마스킹 (Principal의 userId 사용)
      await tx.user.update({
        where: { id: userId },
        data: {
          userId: maskedPrincipalData.userId,
          password: maskedPrincipalData.password,
          name: maskedPrincipalData.name,
        },
      });

      // [9] WithdrawalHistory 기록
      await tx.withdrawalHistory.create({
        data: {
          userId: principal.user.userId,
          userName: principal.user.name,
          userRole: 'PRINCIPAL',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
    });
  }
}

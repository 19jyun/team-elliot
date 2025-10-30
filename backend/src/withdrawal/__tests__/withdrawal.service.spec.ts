import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WithdrawalService } from '../withdrawal.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import * as withdrawalMigrators from '../migrator/anonymized-user.migrator';
import * as maskingRules from '../masker/masking-rules';

// 마이그레이터 함수들 모킹
jest.mock('../migrator/anonymized-user.migrator');
jest.mock('../migrator/payment-migrator', () => ({
  migratePayments: jest.fn(),
}));
jest.mock('../migrator/refund-migrator', () => ({
  migrateRefunds: jest.fn(),
}));
jest.mock('../migrator/attendance-migrator', () => ({
  migrateAttendances: jest.fn(),
}));
jest.mock('../migrator/session-enrollment-migrator', () => ({
  migrateSessionEnrollments: jest.fn(),
}));
jest.mock('../masker/masking-rules');

describe('WithdrawalService', () => {
  let service: WithdrawalService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    refundRequest: {
      findMany: jest.fn(),
    },
    sessionEnrollment: {
      findMany: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    withdrawalHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WithdrawalService>(WithdrawalService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('withdrawStudent', () => {
    const userId = 1;
    const studentId = 100;
    const reason = '개인적인 이유';

    const mockUser = {
      id: userId,
      userId: 'student123',
      password: 'hashed_password',
      name: '테스트 학생',
      role: 'STUDENT',
    };

    const mockStudent = {
      id: studentId,
      userId: 'student123',
      password: 'hashed_password',
      name: '테스트 학생',
      userRefId: userId,
    };

    const mockPayments = [
      {
        id: 1,
        studentId,
        amount: new Decimal(150000),
        status: 'COMPLETED',
        method: 'BANK_TRANSFER',
        paidAt: new Date('2025-01-01'),
        sessionEnrollmentId: 10,
        sessionEnrollment: {
          session: {
            class: {
              academyId: 1,
            },
          },
        },
      },
    ];

    const mockRefunds = [
      {
        id: 1,
        sessionEnrollmentId: 10,
        studentId,
        reason: 'PERSONAL_SCHEDULE',
        detailedReason: '개인 사정',
        refundAmount: new Decimal(150000),
        status: 'APPROVED',
        processReason: null,
        actualRefundAmount: new Decimal(150000),
        processedBy: null,
        requestedAt: new Date('2025-01-05'),
        processedAt: new Date('2025-01-06'),
        cancelledAt: null,
        sessionEnrollment: {
          session: {
            classId: 1,
            class: {
              academyId: 1,
            },
          },
        },
        processor: {
          role: 'PRINCIPAL',
        },
      },
    ];

    const mockSessionEnrollments = [
      {
        id: 10,
        studentId,
        sessionId: 20,
        status: 'CONFIRMED',
        enrolledAt: new Date('2025-01-01'),
        rejectedAt: null,
        cancelledAt: null,
        session: {
          id: 20,
          date: new Date('2025-01-10'),
          classId: 1,
          class: {
            academyId: 1,
          },
        },
      },
    ];

    const mockAttendances = [
      {
        id: 1,
        sessionEnrollmentId: 10,
        classId: 1,
        studentId,
        date: new Date('2025-01-10'),
        status: 'PRESENT',
        note: null,
        class: {
          academyId: 1,
        },
      },
    ];

    const mockAnonymizedUser = {
      id: 1,
      anonymousId: 'ANON_STUDENT_1234567890_ABC123',
    };

    const mockMaskedUserData = {
      userId: 'WITHDRAWN_USER_1',
      password: 'hashed_random_password',
      name: '탈퇴한 사용자',
    };

    const mockMaskedStudentData = {
      userId: 'WITHDRAWN_USER_1',
      password: 'hashed_random_password',
      name: '탈퇴한 사용자',
      phoneNumber: null,
      emergencyContact: null,
      birthDate: null,
      notes: null,
      refundAccountHolder: null,
      refundAccountNumber: null,
      refundBankName: null,
    };

    beforeEach(() => {
      // 기본 모킹 설정
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);
      mockPrismaService.refundRequest.findMany.mockResolvedValue(mockRefunds);
      mockPrismaService.sessionEnrollment.findMany.mockResolvedValue(
        mockSessionEnrollments,
      );
      mockPrismaService.attendance.findMany.mockResolvedValue(mockAttendances);

      // 마이그레이터 함수 모킹
      jest
        .spyOn(withdrawalMigrators, 'createAnonymizedUser')
        .mockResolvedValue(mockAnonymizedUser);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const paymentMigrator = require('../migrator/payment-migrator');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const refundMigrator = require('../migrator/refund-migrator');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sessionEnrollmentMigrator = require('../migrator/session-enrollment-migrator');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const attendanceMigrator = require('../migrator/attendance-migrator');

      jest.spyOn(paymentMigrator, 'migratePayments').mockResolvedValue(1);
      jest.spyOn(refundMigrator, 'migrateRefunds').mockResolvedValue(1);
      jest
        .spyOn(sessionEnrollmentMigrator, 'migrateSessionEnrollments')
        .mockResolvedValue(1);
      jest.spyOn(attendanceMigrator, 'migrateAttendances').mockResolvedValue(1);

      // 마스킹 함수 모킹
      jest
        .spyOn(maskingRules, 'createMaskedUserData')
        .mockReturnValue(mockMaskedUserData);

      jest
        .spyOn(maskingRules, 'createMaskedStudentData')
        .mockReturnValue(mockMaskedStudentData);

      // 트랜잭션 모킹
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          anonymizedUser: {
            create: jest.fn().mockResolvedValue(mockAnonymizedUser),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          student: {
            update: jest.fn().mockResolvedValue({}),
          },
          withdrawalHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx);
      });
    });

    it('should successfully withdraw student with all data', async () => {
      await service.withdrawStudent(userId, reason);

      // 데이터 수집 확인
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userRefId: userId },
      });
      expect(mockPrismaService.payment.findMany).toHaveBeenCalled();
      expect(mockPrismaService.refundRequest.findMany).toHaveBeenCalled();
      expect(mockPrismaService.sessionEnrollment.findMany).toHaveBeenCalled();
      expect(mockPrismaService.attendance.findMany).toHaveBeenCalled();

      // 트랜잭션 실행 확인
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });

    it('should throw NotFoundException when user is not STUDENT', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'TEACHER',
      });

      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        '학생 정보를 찾을 수 없습니다.',
      );
    });

    it('should throw NotFoundException when student not found', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        '학생 정보를 찾을 수 없습니다.',
      );
    });

    it('should handle withdrawal with empty data arrays', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.refundRequest.findMany.mockResolvedValue([]);
      mockPrismaService.sessionEnrollment.findMany.mockResolvedValue([]);
      mockPrismaService.attendance.findMany.mockResolvedValue([]);

      await service.withdrawStudent(userId, reason);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should create anonymized user during withdrawal', async () => {
      await service.withdrawStudent(userId, reason);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        user: { update: jest.fn() },
        student: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(withdrawalMigrators.createAnonymizedUser).toHaveBeenCalledWith(
        mockTx,
        expect.objectContaining({
          userRole: 'STUDENT',
          withdrawalDate: expect.any(Date),
        }),
      );
    });

    it('should mask user and student data during withdrawal', async () => {
      await service.withdrawStudent(userId, reason);

      expect(maskingRules.createMaskedUserData).toHaveBeenCalledWith(userId);
      expect(maskingRules.createMaskedStudentData).toHaveBeenCalledWith(
        studentId,
      );
    });

    it('should create withdrawal history record', async () => {
      await service.withdrawStudent(userId, reason);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        user: { update: jest.fn() },
        student: { update: jest.fn() },
        withdrawalHistory: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      await transactionCallback(mockTx);

      expect(mockTx.withdrawalHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.userId,
          userName: mockUser.name,
          userRole: 'STUDENT',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
    });

    it('should call all migration functions', async () => {
      await service.withdrawStudent(userId, reason);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        user: { update: jest.fn() },
        student: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const paymentMigrator = require('../migrator/payment-migrator');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const refundMigrator = require('../migrator/refund-migrator');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sessionEnrollmentMigrator = require('../migrator/session-enrollment-migrator');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const attendanceMigrator = require('../migrator/attendance-migrator');

      expect(
        sessionEnrollmentMigrator.migrateSessionEnrollments,
      ).toHaveBeenCalled();
      expect(paymentMigrator.migratePayments).toHaveBeenCalled();
      expect(refundMigrator.migrateRefunds).toHaveBeenCalled();
      expect(attendanceMigrator.migrateAttendances).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Database error');
      mockPrismaService.$transaction.mockRejectedValue(error);

      await expect(service.withdrawStudent(userId, reason)).rejects.toThrow(
        error,
      );
    });
  });
});

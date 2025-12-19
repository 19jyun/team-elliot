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
jest.mock('../migrator/teacher-activity.migrator', () => ({
  migrateTeacherActivities: jest.fn(),
}));
jest.mock('../migrator/principal-activity.migrator', () => ({
  migratePrincipalActivities: jest.fn(),
}));
jest.mock('../masker/masking-rules');
jest.mock('../../common/utils/file.util');

describe('WithdrawalService', () => {
  let service: WithdrawalService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    principal: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    academy: {
      update: jest.fn(),
    },
    class: {
      findMany: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
    refundRequest: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    sessionEnrollment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    studentAcademy: {
      deleteMany: jest.fn(),
    },
    rejectionDetail: {
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

  describe('withdrawTeacher', () => {
    const userId = 2;
    const teacherId = 200;
    const reason = '개인적인 이유';

    const mockUser = {
      id: userId,
      userId: 'teacher123',
      password: 'hashed_password',
      name: '테스트 강사',
      role: 'TEACHER',
    };

    const mockTeacher = {
      id: teacherId,
      userId: 'teacher123',
      password: 'hashed_password',
      name: '테스트 강사',
      userRefId: userId,
      academyId: 1,
      classes: [], // no ongoing classes
      user: mockUser,
    };

    const mockClasses = [
      {
        id: 1,
        className: '발레 초급반',
        academyId: 1,
        tuitionFee: new Decimal(150000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        classSessions: [
          {
            id: 10,
            enrollments: [
              {
                id: 100,
                payment: {
                  amount: new Decimal(150000),
                },
              },
              {
                id: 101,
                payment: {
                  amount: new Decimal(150000),
                },
              },
            ],
          },
        ],
      },
    ];

    const mockAnonymizedUser = {
      id: 2,
      anonymousId: 'ANON_TEACHER_1234567890_ABC123',
    };

    const mockMaskedUserData = {
      userId: 'WITHDRAWN_USER_2',
      password: 'hashed_random_password',
      name: '탈퇴한 사용자',
    };

    const mockMaskedTeacherData = {
      userId: 'WITHDRAWN_TEACHER_200',
      password: 'hashed_random_password',
      name: '탈퇴한 강사',
      phoneNumber: null,
      introduction: null,
      photoUrl: null,
      education: [],
      specialties: [],
      certifications: [],
      yearsOfExperience: null,
      availableTimes: null,
      academyId: null,
    };

    beforeEach(() => {
      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.class.findMany.mockResolvedValue(mockClasses);

      jest
        .spyOn(withdrawalMigrators, 'createAnonymizedUser')
        .mockResolvedValue(mockAnonymizedUser);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const teacherActivityMigrator = require('../migrator/teacher-activity.migrator');
      jest
        .spyOn(teacherActivityMigrator, 'migrateTeacherActivities')
        .mockResolvedValue(1);

      jest
        .spyOn(maskingRules, 'createMaskedUserData')
        .mockReturnValue(mockMaskedUserData);
      jest
        .spyOn(maskingRules, 'createMaskedTeacherData')
        .mockReturnValue(mockMaskedTeacherData as any);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          anonymizedUser: {
            create: jest.fn().mockResolvedValue(mockAnonymizedUser),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          teacher: {
            update: jest.fn().mockResolvedValue({}),
          },
          withdrawalHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx);
      });
    });

    it('should successfully withdraw teacher', async () => {
      await service.withdrawTeacher(userId, reason);

      expect(mockPrismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { userRefId: userId },
        include: {
          classes: {
            where: {
              endDate: { gte: expect.any(Date) },
            },
          },
          user: true,
        },
      });
      expect(mockPrismaService.class.findMany).toHaveBeenCalled();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when teacher not found', async () => {
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(service.withdrawTeacher(userId, reason)).rejects.toThrow(
        '강사 정보를 찾을 수 없습니다.',
      );
    });

    it('should throw BadRequestException when has ongoing classes', async () => {
      const teacherWithOngoingClasses = {
        ...mockTeacher,
        classes: [
          {
            id: 1,
            className: '진행 중인 수업',
            endDate: new Date(Date.now() + 86400000), // tomorrow
          },
        ],
      };
      mockPrismaService.teacher.findUnique.mockResolvedValue(
        teacherWithOngoingClasses,
      );

      await expect(service.withdrawTeacher(userId, reason)).rejects.toThrow(
        '진행 중인 수업이 있어 탈퇴할 수 없습니다.',
      );
    });

    it('should create anonymized user and teacher activities', async () => {
      await service.withdrawTeacher(userId, reason);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const teacherActivityMigrator = require('../migrator/teacher-activity.migrator');

      expect(withdrawalMigrators.createAnonymizedUser).toHaveBeenCalled();
      expect(
        teacherActivityMigrator.migrateTeacherActivities,
      ).toHaveBeenCalledWith(
        expect.anything(),
        {
          classes: mockClasses,
        },
        mockAnonymizedUser.id,
        expect.any(Date),
      );
    });

    it('should mask teacher and user data', async () => {
      await service.withdrawTeacher(userId, reason);

      // createMaskedTeacherData만 호출됨 (User 데이터는 Teacher 마스킹 데이터에서 가져옴)
      expect(maskingRules.createMaskedTeacherData).toHaveBeenCalledWith(
        teacherId,
      );
    });

    it('should set teacher academyId to null', async () => {
      await service.withdrawTeacher(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        user: { update: jest.fn() },
        teacher: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(mockTx.teacher.update).toHaveBeenCalledWith({
        where: { id: teacherId },
        data: expect.objectContaining({
          academyId: null,
        }),
      });
    });

    it('should create withdrawal history', async () => {
      await service.withdrawTeacher(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        user: { update: jest.fn() },
        teacher: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(mockTx.withdrawalHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.userId,
          userName: mockUser.name,
          userRole: 'TEACHER',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
    });

    it('should delete profile photo if exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { FileUtil } = require('../../common/utils/file.util');
      const teacherWithPhoto = {
        ...mockTeacher,
        photoUrl: '/uploads/teacher-photos/test-photo.jpg',
      };
      mockPrismaService.teacher.findUnique.mockResolvedValue(teacherWithPhoto);

      await service.withdrawTeacher(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        user: { update: jest.fn() },
        teacher: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(FileUtil.deleteProfilePhoto).toHaveBeenCalledWith(
        '/uploads/teacher-photos/test-photo.jpg',
      );
    });

    it('should not delete photo if photoUrl is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { FileUtil } = require('../../common/utils/file.util');
      const teacherWithoutPhoto = {
        ...mockTeacher,
        photoUrl: null,
      };
      mockPrismaService.teacher.findUnique.mockResolvedValue(
        teacherWithoutPhoto,
      );

      await service.withdrawTeacher(userId, reason);

      expect(FileUtil.deleteProfilePhoto).not.toHaveBeenCalled();
    });
  });

  describe('withdrawPrincipal', () => {
    const userId = 3;
    const principalId = 300;
    const academyId = 1;
    const reason = '개인적인 이유';

    const mockUser = {
      id: userId,
      userId: 'principal123',
      password: 'hashed_password',
      name: '테스트 원장',
      role: 'PRINCIPAL',
    };

    const mockAcademy = {
      id: academyId,
      name: '테스트 학원',
      code: 'ACADEMY_123',
      createdAt: new Date('2023-01-01'),
      classes: [], // no ongoing classes
      teachers: [{ id: 200 }],
      students: [{ id: 100, student: { id: 100 } }],
    };

    const mockPrincipal = {
      id: principalId,
      userId: 'principal123',
      password: 'hashed_password',
      name: '테스트 원장',
      userRefId: userId,
      academyId: academyId,
      accountHolder: '테스트원장',
      accountNumber: '123-456-789012',
      bankName: '국민은행',
      academy: mockAcademy,
      user: mockUser,
    };

    const mockClasses = [
      {
        id: 1,
        className: '발레 초급반',
        academyId: academyId,
        tuitionFee: new Decimal(150000),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        classSessions: [
          {
            id: 10,
            enrollments: [
              {
                id: 100,
                payment: {
                  amount: new Decimal(150000),
                },
              },
            ],
          },
        ],
        teacher: { id: 200, name: '테스트 강사' },
      },
    ];

    const mockRefunds = [];
    const mockRejections = [];
    const mockTeachers = [{ id: 200, createdAt: new Date('2023-06-01') }];

    const mockAnonymizedUser = {
      id: 3,
      anonymousId: 'ANON_PRINCIPAL_1234567890_ABC123',
    };

    const mockMaskedUserData = {
      userId: 'WITHDRAWN_USER_3',
      password: 'hashed_random_password',
      name: '탈퇴한 사용자',
    };

    const mockMaskedPrincipalData = {
      userId: 'WITHDRAWN_PRINCIPAL_300',
      password: 'hashed_random_password',
      name: '탈퇴한 원장',
      phoneNumber: null,
      email: null,
      introduction: null,
      photoUrl: null,
      education: [],
      certifications: [],
      yearsOfExperience: null,
      accountHolder: null,
      accountNumber: null,
      bankName: null,
    };

    const mockMaskedAcademyData = {
      name: '탈퇴한 학원',
      phoneNumber: '000-0000-0000',
      address: '주소 정보 없음',
      description: '탈퇴한 학원입니다',
    };

    beforeEach(() => {
      mockPrismaService.principal.findUnique.mockResolvedValue(mockPrincipal);
      mockPrismaService.refundRequest.count.mockResolvedValue(0);
      mockPrismaService.sessionEnrollment.count.mockResolvedValue(0);
      mockPrismaService.class.findMany.mockResolvedValue(mockClasses);
      mockPrismaService.refundRequest.findMany.mockResolvedValue(mockRefunds);
      mockPrismaService.rejectionDetail.findMany.mockResolvedValue(
        mockRejections,
      );
      mockPrismaService.teacher.findMany.mockResolvedValue(mockTeachers);

      jest
        .spyOn(withdrawalMigrators, 'createAnonymizedUser')
        .mockResolvedValue(mockAnonymizedUser);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const principalActivityMigrator = require('../migrator/principal-activity.migrator');
      jest
        .spyOn(principalActivityMigrator, 'migratePrincipalActivities')
        .mockResolvedValue(1);

      jest
        .spyOn(maskingRules, 'createMaskedUserData')
        .mockReturnValue(mockMaskedUserData);
      jest
        .spyOn(maskingRules, 'createMaskedPrincipalData')
        .mockReturnValue(mockMaskedPrincipalData as any);
      jest
        .spyOn(maskingRules, 'createMaskedAcademyData')
        .mockReturnValue(mockMaskedAcademyData);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          anonymizedUser: {
            create: jest.fn().mockResolvedValue(mockAnonymizedUser),
          },
          studentAcademy: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          teacher: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          academy: {
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          principal: {
            update: jest.fn().mockResolvedValue({}),
          },
          withdrawalHistory: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx);
      });
    });

    it('should successfully withdraw principal', async () => {
      await service.withdrawPrincipal(userId, reason);

      expect(mockPrismaService.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId: userId },
        include: {
          academy: {
            include: {
              classes: {
                where: {
                  endDate: { gte: expect.any(Date) },
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
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when principal not found', async () => {
      mockPrismaService.principal.findUnique.mockResolvedValue(null);

      await expect(service.withdrawPrincipal(userId, reason)).rejects.toThrow(
        '원장 또는 학원 정보를 찾을 수 없습니다.',
      );
    });

    it('should throw BadRequestException when has ongoing classes', async () => {
      const principalWithOngoingClasses = {
        ...mockPrincipal,
        academy: {
          ...mockAcademy,
          classes: [
            {
              id: 1,
              className: '진행 중인 수업',
              endDate: new Date(Date.now() + 86400000), // tomorrow
            },
          ],
        },
      };
      mockPrismaService.principal.findUnique.mockResolvedValue(
        principalWithOngoingClasses,
      );

      await expect(service.withdrawPrincipal(userId, reason)).rejects.toThrow(
        '진행 중인 수업이 있어 탈퇴할 수 없습니다.',
      );
    });

    it('should throw BadRequestException when has pending refunds', async () => {
      mockPrismaService.refundRequest.count.mockResolvedValue(1);

      await expect(service.withdrawPrincipal(userId, reason)).rejects.toThrow(
        '처리되지 않은 환불 요청이 있어 탈퇴할 수 없습니다.',
      );
    });

    it('should throw BadRequestException when has pending enrollments', async () => {
      mockPrismaService.sessionEnrollment.count.mockResolvedValue(1);

      await expect(service.withdrawPrincipal(userId, reason)).rejects.toThrow(
        '처리되지 않은 수강 신청이 있어 탈퇴할 수 없습니다.',
      );
    });

    it('should delete all students from academy', async () => {
      await service.withdrawPrincipal(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        studentAcademy: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        teacher: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        academy: { update: jest.fn() },
        user: { update: jest.fn() },
        principal: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(mockTx.studentAcademy.deleteMany).toHaveBeenCalledWith({
        where: { academyId: academyId },
      });
    });

    it('should disconnect all teachers from academy', async () => {
      await service.withdrawPrincipal(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        studentAcademy: { deleteMany: jest.fn() },
        teacher: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        academy: { update: jest.fn() },
        user: { update: jest.fn() },
        principal: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(mockTx.teacher.updateMany).toHaveBeenCalledWith({
        where: { academyId: academyId },
        data: { academyId: null },
      });
    });

    it('should mask academy data', async () => {
      await service.withdrawPrincipal(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        studentAcademy: { deleteMany: jest.fn() },
        teacher: { updateMany: jest.fn() },
        academy: { update: jest.fn() },
        user: { update: jest.fn() },
        principal: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(maskingRules.createMaskedAcademyData).toHaveBeenCalledWith(
        academyId,
      );
      expect(mockTx.academy.update).toHaveBeenCalledWith({
        where: { id: academyId },
        data: mockMaskedAcademyData,
      });
    });

    it('should mask principal and user data', async () => {
      await service.withdrawPrincipal(userId, reason);

      // createMaskedPrincipalData만 호출됨 (User 데이터는 Principal 마스킹 데이터에서 가져옴)
      expect(maskingRules.createMaskedPrincipalData).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should create anonymized user and principal activities', async () => {
      await service.withdrawPrincipal(userId, reason);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const principalActivityMigrator = require('../migrator/principal-activity.migrator');

      expect(withdrawalMigrators.createAnonymizedUser).toHaveBeenCalled();
      expect(
        principalActivityMigrator.migratePrincipalActivities,
      ).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          academy: mockAcademy,
          classes: mockClasses,
          refundProcessHistory: mockRefunds,
          rejectionHistory: mockRejections,
          teacherManagementHistory: mockTeachers,
          accountInfo: {
            accountHolder: mockPrincipal.accountHolder,
            accountNumber: mockPrincipal.accountNumber,
            bankName: mockPrincipal.bankName,
          },
        }),
        mockAnonymizedUser.id,
        expect.any(Date),
      );
    });

    it('should create withdrawal history', async () => {
      await service.withdrawPrincipal(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        studentAcademy: { deleteMany: jest.fn() },
        teacher: { updateMany: jest.fn() },
        academy: { update: jest.fn() },
        user: { update: jest.fn() },
        principal: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(mockTx.withdrawalHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.userId,
          userName: mockUser.name,
          userRole: 'PRINCIPAL',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
    });

    it('should delete profile photo if exists', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { FileUtil } = require('../../common/utils/file.util');
      const principalWithPhoto = {
        ...mockPrincipal,
        photoUrl: '/uploads/principal-photos/test-photo.jpg',
      };
      mockPrismaService.principal.findUnique.mockResolvedValue(
        principalWithPhoto,
      );

      await service.withdrawPrincipal(userId, reason);

      const transactionCallback =
        mockPrismaService.$transaction.mock.calls[0][0];
      const mockTx = {
        anonymizedUser: {
          create: jest.fn().mockResolvedValue(mockAnonymizedUser),
        },
        studentAcademy: { deleteMany: jest.fn() },
        teacher: { updateMany: jest.fn() },
        academy: { update: jest.fn() },
        user: { update: jest.fn() },
        principal: { update: jest.fn() },
        withdrawalHistory: { create: jest.fn() },
      };

      await transactionCallback(mockTx);

      expect(FileUtil.deleteProfilePhoto).toHaveBeenCalledWith(
        '/uploads/principal-photos/test-photo.jpg',
      );
    });

    it('should not delete photo if photoUrl is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { FileUtil } = require('../../common/utils/file.util');
      const principalWithoutPhoto = {
        ...mockPrincipal,
        photoUrl: null,
      };
      mockPrismaService.principal.findUnique.mockResolvedValue(
        principalWithoutPhoto,
      );

      await service.withdrawPrincipal(userId, reason);

      expect(FileUtil.deleteProfilePhoto).not.toHaveBeenCalled();
    });
  });
});

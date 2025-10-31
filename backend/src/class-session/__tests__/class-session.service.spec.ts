import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionService } from '../class-session.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../../socket/socket.gateway';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  UpdateEnrollmentStatusDto,
  SessionEnrollmentStatus,
} from '../dto/update-enrollment-status.dto';
import { ChangeEnrollmentDto } from '../dto/change-enrollment.dto';

describe('ClassSessionService', () => {
  let service: ClassSessionService;
  let prisma: any;
  // let socketGateway: any;

  const mockPrisma = {
    classSession: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sessionEnrollment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
    academy: {
      findUnique: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    attendance: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    principal: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockSocketGateway = {
    emitToUser: jest.fn(),
    notifyEnrollmentUpdate: jest.fn(),
    notifyNewEnrollmentRequest: jest.fn(),
  };

  const mockPushNotificationService = {
    sendToUser: jest.fn(),
    sendToUsers: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SocketGateway, useValue: mockSocketGateway },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();
    service = module.get<ClassSessionService>(ClassSessionService);
    prisma = module.get<PrismaService>(PrismaService);
    // socketGateway = module.get<SocketGateway>(SocketGateway);
    jest.clearAllMocks();
  });

  describe('createClassSession', () => {
    it('should create a class session successfully', async () => {
      const sessionData = {
        classId: 1,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
      };
      const teacherId = 1;
      const createdSession = { id: 1, ...sessionData };

      prisma.class.findUnique.mockResolvedValue({ id: 1, teacherId: 1 });
      prisma.classSession.create.mockResolvedValue(createdSession);

      const result = await service.createClassSession(sessionData, teacherId);

      expect(result).toEqual(createdSession);
      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: sessionData.classId },
        include: {
          teacher: true,
        },
      });
      expect(prisma.classSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          classId: sessionData.classId,
          date: sessionData.date,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
        }),
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
          enrollments: {
            include: {
              student: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when class not found', async () => {
      const sessionData = {
        classId: 999,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
      };
      const teacherId = 1;

      prisma.class.findUnique.mockResolvedValue(null);

      await expect(
        service.createClassSession(sessionData, teacherId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when teacher is not authorized', async () => {
      const sessionData = {
        classId: 1,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
      };
      const teacherId = 2; // 다른 강사

      prisma.class.findUnique.mockResolvedValue({ id: 1, teacherId: 1 });

      await expect(
        service.createClassSession(sessionData, teacherId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateClassSession', () => {
    it('should update a class session successfully', async () => {
      const sessionId = 1;
      const updateData = {
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T14:00:00'),
        endTime: new Date('2024-01-16T15:00:00'),
      };
      const teacherId = 1;
      const updatedSession = { id: sessionId, ...updateData };

      prisma.classSession.findUnique.mockResolvedValue({
        id: sessionId,
        class: { teacherId: 1 },
      });
      prisma.classSession.update.mockResolvedValue(updatedSession);

      const result = await service.updateClassSession(
        sessionId,
        updateData,
        teacherId,
      );

      expect(result).toEqual(updatedSession);
      expect(prisma.classSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
        },
      });
      expect(prisma.classSession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: updateData,
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
          enrollments: {
            include: {
              student: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when session not found', async () => {
      const sessionId = 999;
      const updateData = { date: new Date() };
      const teacherId = 1;

      prisma.classSession.findUnique.mockResolvedValue(null);

      await expect(
        service.updateClassSession(sessionId, updateData, teacherId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteClassSession', () => {
    it('should delete a class session successfully', async () => {
      const sessionId = 1;
      const teacherId = 1;
      const result = { message: '세션이 성공적으로 삭제되었습니다.' };

      prisma.classSession.findUnique.mockResolvedValue({
        id: sessionId,
        class: { teacherId: 1 },
        enrollments: [],
      });
      prisma.classSession.delete.mockResolvedValue({ id: sessionId });

      const response = await service.deleteClassSession(sessionId, teacherId);

      expect(response).toEqual(result);
      expect(prisma.classSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
          enrollments: {
            include: {
              payment: true,
            },
          },
        },
      });
      expect(prisma.classSession.delete).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
    });

    it('should throw BadRequestException when session has enrollments', async () => {
      const sessionId = 1;
      const teacherId = 1;

      prisma.classSession.findUnique.mockResolvedValue({
        id: sessionId,
        class: { teacherId: 1 },
        enrollments: [{ id: 1 }], // 수강생이 있음
      });

      await expect(
        service.deleteClassSession(sessionId, teacherId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('enrollSession', () => {
    it('should enroll in a session successfully', async () => {
      const sessionId = 1;
      const studentId = 1;

      // 현재 시간을 고정 (2025-01-15 12:00:00)
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));

      const sessionDate = new Date('2025-01-15');
      const startTime = new Date('1970-01-01T23:00:00');
      const mockSession = {
        id: sessionId,
        currentStudents: 5,
        date: sessionDate,
        startTime: startTime,
        class: {
          maxStudents: 10,
          tuitionFee: 50000,
        },
        enrollments: [],
      };

      prisma.classSession.findUnique.mockResolvedValue(mockSession);
      prisma.student.findUnique.mockResolvedValue({ id: studentId });
      prisma.sessionEnrollment.findUnique.mockResolvedValue(null); // 기존 수강 신청 없음

      const mockEnrollment = {
        id: 2,
        sessionId: sessionId,
        studentId: studentId,
        status: 'PENDING',
        session: {
          classId: 1,
          class: {
            academyId: 1,
            tuitionFee: 50000,
            className: 'Test Class',
          },
        },
        student: {
          name: 'Test Student',
        },
      };

      // 트랜잭션 모킹
      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          ...mockPrisma,
          sessionEnrollment: {
            ...mockPrisma.sessionEnrollment,
            create: jest.fn().mockResolvedValue(mockEnrollment),
          },
          payment: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              sessionEnrollmentId: mockEnrollment.id,
              amount: 50000,
              method: 'BANK_TRANSFER',
              status: 'PENDING',
            }),
          },
        };
        return await callback(mockTx);
      });

      // 푸시 알림을 위한 academy와 class 조회 모킹
      prisma.academy.findUnique.mockResolvedValue({
        id: 1,
        principal: {
          id: 1,
          user: { id: 10 },
        },
      });
      prisma.class.findUnique.mockResolvedValue({
        id: 1,
        teacher: {
          id: 2,
          user: { id: 20 },
        },
      });

      const result = await service.enrollSession(sessionId, studentId);

      expect(result).toEqual(mockEnrollment);
      expect(prisma.classSession.findUnique).toHaveBeenCalledWith({
        where: { id: sessionId },
        include: { class: true },
      });
      expect(prisma.$transaction).toHaveBeenCalled();

      // 푸시 알림 전송 확인
      expect(mockPushNotificationService.sendToUsers).toHaveBeenCalledWith(
        expect.arrayContaining([10, 20]), // 원장과 선생의 User ID
        expect.objectContaining({
          title: '새로운 수강 신청',
          body: expect.stringContaining('Test Student'),
        }),
      );

      // 타이머 복원
      jest.useRealTimers();
    });

    it('should throw BadRequestException when already enrolled', async () => {
      const sessionId = 1;
      const studentId = 1;

      const sessionDate = new Date('2025-01-15');
      const startTime = new Date('1970-01-01T23:00:00');
      prisma.classSession.findUnique.mockResolvedValue({
        id: sessionId,
        currentStudents: 5,
        date: sessionDate,
        startTime: startTime,
        class: { maxStudents: 10 },
        enrollments: [],
      });
      prisma.student.findUnique.mockResolvedValue({ id: studentId });
      prisma.sessionEnrollment.findUnique.mockResolvedValue({
        id: 1,
        status: 'CONFIRMED', // 활성 상태로 설정하여 중복 신청 에러 발생
      }); // 이미 등록됨

      await expect(service.enrollSession(sessionId, studentId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('cancelEnrollment', () => {
    it('should cancel enrollment successfully', async () => {
      const enrollmentId = 1;
      const studentId = 1;
      // const result = { message: '수강 신청이 취소되었습니다.' };

      const cancelledEnrollment = { id: enrollmentId, status: 'CANCELLED' };
      prisma.sessionEnrollment.findUnique.mockResolvedValue({
        id: enrollmentId,
        studentId: 1,
        status: 'CONFIRMED',
        session: { startTime: new Date('2025-12-31T23:59:59') },
      });
      prisma.sessionEnrollment.update.mockResolvedValue(cancelledEnrollment);

      const response = await service.cancelEnrollment(enrollmentId, studentId);

      expect(response).toEqual(cancelledEnrollment);
      expect(prisma.sessionEnrollment.findUnique).toHaveBeenCalledWith({
        where: { id: enrollmentId },
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
          student: true,
        },
      });
      expect(prisma.sessionEnrollment.update).toHaveBeenCalledWith({
        where: { id: enrollmentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        },
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
          student: true,
        },
      });
    });

    it('should throw NotFoundException when enrollment not found', async () => {
      const enrollmentId = 999;
      const studentId = 1;

      prisma.sessionEnrollment.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelEnrollment(enrollmentId, studentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEnrollmentStatus', () => {
    it('should update enrollment status successfully', async () => {
      const enrollmentId = 1;
      const updateDto: UpdateEnrollmentStatusDto = {
        status: SessionEnrollmentStatus.CONFIRMED,
        reason: 'Payment confirmed',
      };
      const teacherId = 1;
      // const result = { message: '수강 신청 상태가 업데이트되었습니다.' };

      prisma.sessionEnrollment.findUnique.mockResolvedValue({
        id: enrollmentId,
        session: { class: { teacherId: 1 } },
      });
      prisma.sessionEnrollment.update.mockResolvedValue({ id: enrollmentId });

      const response = await service.updateEnrollmentStatus(
        enrollmentId,
        updateDto,
        teacherId,
      );

      expect(response).toEqual({ id: enrollmentId });
      expect(prisma.sessionEnrollment.findUnique).toHaveBeenCalledWith({
        where: { id: enrollmentId },
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
          student: true,
        },
      });
      expect(prisma.sessionEnrollment.update).toHaveBeenCalledTimes(2);
      expect(prisma.sessionEnrollment.update).toHaveBeenNthCalledWith(1, {
        where: { id: enrollmentId },
        data: { status: updateDto.status },
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
          student: true,
        },
      });
      expect(prisma.sessionEnrollment.update).toHaveBeenNthCalledWith(2, {
        where: { id: enrollmentId },
        data: { hasContributedToCurrentStudents: true },
      });
    });
  });

  describe('checkAttendance', () => {
    it('should check attendance successfully (PRESENT)', async () => {
      const enrollmentId = 1;
      const attendanceStatus = 'PRESENT';
      const teacherId = 1;

      const today = new Date();
      const sessionDate = new Date(today);
      sessionDate.setHours(0, 0, 0, 0);

      const mockEnrollment = {
        id: enrollmentId,
        studentId: 1,
        classId: 1,
        session: {
          id: 1,
          classId: 1,
          date: sessionDate,
          class: { teacherId: 1 },
        },
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(mockEnrollment);
      prisma.teacher.findUnique.mockResolvedValue({
        id: teacherId,
        userRefId: teacherId,
      });
      prisma.attendance.findFirst.mockResolvedValue(null); // 기존 출석 기록 없음
      prisma.attendance.create.mockResolvedValue({
        id: 1,
        sessionEnrollmentId: enrollmentId,
        status: attendanceStatus,
      });

      const response = await service.checkAttendance(
        enrollmentId,
        attendanceStatus,
        teacherId,
        'TEACHER',
      );

      expect(response).toBeDefined();
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { userRefId: teacherId },
        select: { id: true },
      });
      expect(prisma.sessionEnrollment.findUnique).toHaveBeenCalledWith({
        where: { id: enrollmentId },
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
          student: true,
        },
      });
      expect(prisma.attendance.findFirst).toHaveBeenCalled();
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sessionEnrollmentId: enrollmentId,
          classId: mockEnrollment.classId,
          studentId: mockEnrollment.studentId,
          status: attendanceStatus,
        }),
      });
    });

    it('should check attendance successfully (ABSENT)', async () => {
      const enrollmentId = 1;
      const attendanceStatus = 'ABSENT';
      const teacherId = 1;

      const today = new Date();
      const sessionDate = new Date(today);
      sessionDate.setHours(0, 0, 0, 0);

      const mockEnrollment = {
        id: enrollmentId,
        studentId: 1,
        classId: 1,
        session: {
          id: 1,
          classId: 1,
          date: sessionDate,
          class: { teacherId: 1 },
        },
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(mockEnrollment);
      prisma.teacher.findUnique.mockResolvedValue({
        id: teacherId,
        userRefId: teacherId,
      });
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.create.mockResolvedValue({
        id: 1,
        sessionEnrollmentId: enrollmentId,
        status: attendanceStatus,
      });

      const response = await service.checkAttendance(
        enrollmentId,
        attendanceStatus,
        teacherId,
        'TEACHER',
      );

      expect(response).toBeDefined();
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: attendanceStatus,
        }),
      });
    });

    it('should update existing attendance record', async () => {
      const enrollmentId = 1;
      const attendanceStatus = 'PRESENT';
      const teacherId = 1;

      const today = new Date();
      const sessionDate = new Date(today);
      sessionDate.setHours(0, 0, 0, 0);

      const mockEnrollment = {
        id: enrollmentId,
        studentId: 1,
        classId: 1,
        session: {
          id: 1,
          classId: 1,
          date: sessionDate,
          class: { teacherId: 1 },
        },
      };

      const existingAttendance = {
        id: 1,
        sessionEnrollmentId: enrollmentId,
        status: 'ABSENT',
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(mockEnrollment);
      prisma.teacher.findUnique.mockResolvedValue({
        id: teacherId,
        userRefId: teacherId,
      });
      prisma.attendance.findFirst.mockResolvedValue(existingAttendance);
      prisma.attendance.update.mockResolvedValue({
        ...existingAttendance,
        status: attendanceStatus,
      });

      const response = await service.checkAttendance(
        enrollmentId,
        attendanceStatus,
        teacherId,
        'TEACHER',
      );

      expect(response).toBeDefined();
      expect(prisma.attendance.update).toHaveBeenCalledWith({
        where: { id: existingAttendance.id },
        data: { status: attendanceStatus },
      });
    });
  });

  describe('changeEnrollment', () => {
    it('should change enrollment successfully', async () => {
      const enrollmentId = 1;
      const changeDto: ChangeEnrollmentDto = {
        newSessionId: 2,
        reason: 'Schedule conflict',
      };
      const studentId = 1;
      const result = {
        message: '수강 변경이 완료되었습니다.',
        cancelledEnrollment: { id: 1 },
        newEnrollment: {
          id: 2,
          sessionId: 2,
          studentId: 1,
          session: {
            class: {
              academyId: 1,
            },
          },
        },
      };

      const mockCurrentEnrollment = {
        id: enrollmentId,
        studentId: 1,
        session: {
          startTime: new Date('2025-12-31T23:59:59'),
          class: {
            academyId: 1,
          },
        },
      };

      const mockNewEnrollment = {
        id: 2,
        sessionId: 2,
        studentId: 1,
        status: 'PENDING',
        session: {
          class: {
            academyId: 1,
            tuitionFee: 50000,
          },
        },
      };

      prisma.sessionEnrollment.findUnique
        .mockResolvedValueOnce(mockCurrentEnrollment)
        .mockResolvedValueOnce(null); // 새로운 세션에 대한 기존 등록 없음
      prisma.classSession.findUnique.mockResolvedValue({
        id: 2,
        currentStudents: 5,
        startTime: new Date('2026-01-01T00:00:00'),
        class: { maxStudents: 10 },
        enrollments: [],
      });

      // 트랜잭션 모킹
      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          ...mockPrisma,
          sessionEnrollment: {
            ...mockPrisma.sessionEnrollment,
            update: jest.fn().mockResolvedValue({ id: enrollmentId }),
            create: jest.fn().mockResolvedValue(mockNewEnrollment),
          },
          payment: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              sessionEnrollmentId: mockNewEnrollment.id,
              amount: 50000,
              method: 'BANK_TRANSFER',
              status: 'PENDING',
            }),
          },
        };
        return await callback(mockTx);
      });

      const response = await service.changeEnrollment(
        enrollmentId,
        changeDto,
        studentId,
      );

      expect(response.message).toEqual(result.message);
      expect(response.cancelledEnrollment).toBeDefined();
      expect(response.newEnrollment).toBeDefined();
      expect(response.newEnrollment.sessionId).toEqual(
        result.newEnrollment.sessionId,
      );
      expect(response.newEnrollment.studentId).toEqual(
        result.newEnrollment.studentId,
      );
      expect(prisma.sessionEnrollment.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTeacherEnrollments', () => {
    it('should get teacher enrollments', async () => {
      const teacherId = 1;
      const filters = { status: SessionEnrollmentStatus.CONFIRMED };
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];

      prisma.sessionEnrollment.findMany.mockResolvedValue(enrollments);

      const result = await service.getTeacherEnrollments(teacherId, filters);

      expect(result).toEqual(enrollments);
      expect(prisma.sessionEnrollment.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('getStudentEnrollments', () => {
    it('should get student enrollments', async () => {
      const studentId = 1;
      const filters = { status: SessionEnrollmentStatus.CONFIRMED };
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];

      prisma.sessionEnrollment.findMany.mockResolvedValue(enrollments);

      const result = await service.getStudentEnrollments(studentId, filters);

      expect(result).toEqual(enrollments);
      expect(prisma.sessionEnrollment.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });
});

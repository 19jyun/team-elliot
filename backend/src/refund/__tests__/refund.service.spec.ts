import { Test, TestingModule } from '@nestjs/testing';
import { RefundService } from '../refund.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassSessionService } from '../../class-session/class-session.service';
import { SocketGateway } from '../../socket/socket.gateway';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { RefundRequestDto, RefundReason } from '../dto/refund-request.dto';
// import { RefundProcessDto } from '../dto/refund-process.dto';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('RefundService', () => {
  let service: RefundService;
  let prisma: any;
  // let classSessionService: any;
  let socketGateway: any;

  const mockPrisma = {
    sessionEnrollment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refundRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    principal: {
      findUnique: jest.fn(),
    },
    classSession: {
      findMany: jest.fn(),
    },
    academy: {
      findUnique: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockClassSessionService = {
    getPrincipalRefundRequests: jest.fn(),
    getPrincipalSessionsWithRefundRequests: jest.fn(),
  };

  const mockSocketGateway = {
    emitToUser: jest.fn(),
    notifyNewRefundRequest: jest.fn(),
  };

  const mockPushNotificationService = {
    sendToUser: jest.fn(),
    sendToUsers: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ClassSessionService, useValue: mockClassSessionService },
        { provide: SocketGateway, useValue: mockSocketGateway },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();
    service = module.get<RefundService>(RefundService);
    prisma = module.get<PrismaService>(PrismaService);
    // classSessionService = module.get<ClassSessionService>(ClassSessionService);
    socketGateway = module.get<SocketGateway>(SocketGateway);
    jest.clearAllMocks();
  });

  describe('createRefundRequest', () => {
    it('should create a refund request successfully', async () => {
      const refundRequestDto: RefundRequestDto = {
        sessionEnrollmentId: 1,
        reason: RefundReason.PERSONAL_SCHEDULE,
        detailedReason: 'Schedule conflict with another class',
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
      };
      const studentId = 1;
      const sessionEnrollment = {
        id: 1,
        studentId: 1,
        session: {
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24시간 후
        },
        student: { id: 1 },
        payment: { id: 1 },
      };
      const createdRefundRequest = {
        id: 1,
        ...refundRequestDto,
        status: 'PENDING',
        studentId: studentId,
        sessionEnrollment: {
          sessionId: 1,
          session: {
            classId: 1,
            class: {
              academyId: 1,
              className: 'Test Class',
            },
          },
        },
        student: {
          name: 'Test Student',
        },
      };
      const updatedEnrollment = { id: 1, status: 'REFUND_REQUESTED' };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(sessionEnrollment);
      prisma.refundRequest.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([
        createdRefundRequest,
        updatedEnrollment,
      ]);

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

      const result = await service.createRefundRequest(
        refundRequestDto,
        studentId,
      );

      expect(result).toEqual(createdRefundRequest);
      expect(prisma.sessionEnrollment.findUnique).toHaveBeenCalledWith({
        where: { id: refundRequestDto.sessionEnrollmentId },
        include: expect.any(Object),
      });
      expect(prisma.refundRequest.findFirst).toHaveBeenCalledWith({
        where: {
          sessionEnrollmentId: refundRequestDto.sessionEnrollmentId,
          status: { in: ['PENDING', 'APPROVED', 'PARTIAL_APPROVED'] },
        },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(socketGateway.notifyNewRefundRequest).toHaveBeenCalled();

      // 푸시 알림 전송 확인 (원장에게만)
      expect(mockPushNotificationService.sendToUser).toHaveBeenCalledWith(
        10, // 원장의 User ID
        expect.objectContaining({
          title: '새로운 환불 요청',
          body: expect.stringContaining('Test Student'),
        }),
      );
    });

    it('should throw NotFoundException when session enrollment not found', async () => {
      const refundRequestDto: RefundRequestDto = {
        sessionEnrollmentId: 999,
        reason: RefundReason.PERSONAL_SCHEDULE,
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
      };
      const studentId = 1;

      prisma.sessionEnrollment.findUnique.mockResolvedValue(null);

      await expect(
        service.createRefundRequest(refundRequestDto, studentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when student is not the owner', async () => {
      const refundRequestDto: RefundRequestDto = {
        sessionEnrollmentId: 1,
        reason: RefundReason.PERSONAL_SCHEDULE,
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
      };
      const studentId = 2; // 다른 학생
      const sessionEnrollment = {
        id: 1,
        studentId: 1, // 다른 학생의 수강 신청
        session: { startTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        student: { id: 1 },
        payment: { id: 1 },
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(sessionEnrollment);

      await expect(
        service.createRefundRequest(refundRequestDto, studentId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when refund request already exists', async () => {
      const refundRequestDto: RefundRequestDto = {
        sessionEnrollmentId: 1,
        reason: RefundReason.PERSONAL_SCHEDULE,
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
      };
      const studentId = 1;
      const sessionEnrollment = {
        id: 1,
        studentId: 1,
        session: { startTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        student: { id: 1 },
        payment: { id: 1 },
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(sessionEnrollment);
      prisma.refundRequest.findFirst.mockResolvedValue({ id: 1 }); // 이미 환불 요청이 존재

      await expect(
        service.createRefundRequest(refundRequestDto, studentId),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when class has already started', async () => {
      const refundRequestDto: RefundRequestDto = {
        sessionEnrollmentId: 1,
        reason: RefundReason.PERSONAL_SCHEDULE,
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
      };
      const studentId = 1;
      const sessionEnrollment = {
        id: 1,
        studentId: 1,
        session: {
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24시간 전 (이미 시작됨)
        },
        student: { id: 1 },
        payment: { id: 1 },
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(sessionEnrollment);
      prisma.refundRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.createRefundRequest(refundRequestDto, studentId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelRefundRequest', () => {
    it('should cancel a refund request successfully', async () => {
      const refundRequestId = 1;
      const studentId = 1;
      const refundRequest = {
        id: 1,
        studentId: 1,
        sessionEnrollmentId: 1,
        status: 'PENDING',
      };
      const cancelledRefundRequest = {
        id: 1,
        studentId: 1,
        sessionEnrollmentId: 1,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      };

      prisma.refundRequest.findUnique.mockResolvedValue(refundRequest);
      prisma.refundRequest.update.mockResolvedValue(cancelledRefundRequest);

      const response = await service.cancelRefundRequest(
        refundRequestId,
        studentId,
      );

      expect(response).toEqual(cancelledRefundRequest);
      expect(prisma.refundRequest.findUnique).toHaveBeenCalledWith({
        where: { id: refundRequestId },
        include: expect.any(Object),
      });
      expect(prisma.refundRequest.update).toHaveBeenCalledWith({
        where: { id: refundRequestId },
        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when refund request not found', async () => {
      const refundRequestId = 999;
      const studentId = 1;

      prisma.refundRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelRefundRequest(refundRequestId, studentId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when student is not the owner', async () => {
      const refundRequestId = 1;
      const studentId = 2; // 다른 학생
      const refundRequest = {
        id: 1,
        studentId: 1, // 다른 학생의 환불 요청
        sessionEnrollmentId: 1,
        status: 'PENDING',
      };

      prisma.refundRequest.findUnique.mockResolvedValue(refundRequest);

      await expect(
        service.cancelRefundRequest(refundRequestId, studentId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStudentRefundRequests', () => {
    it('should get student refund requests successfully', async () => {
      const studentId = 1;
      const refundRequests = [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          reason: RefundReason.PERSONAL_SCHEDULE,
          refundAmount: 50000,
          status: 'PENDING',
        },
        {
          id: 2,
          sessionEnrollmentId: 2,
          studentId: 1,
          reason: RefundReason.OTHER,
          refundAmount: 30000,
          status: 'APPROVED',
        },
      ];

      prisma.refundRequest.findMany.mockResolvedValue(refundRequests);

      const result = await service.getStudentRefundRequests(studentId);

      expect(result).toEqual(refundRequests);
      expect(prisma.refundRequest.findMany).toHaveBeenCalledWith({
        where: { studentId },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('getAllRefundRequests', () => {
    it('should get all refund requests without status filter', async () => {
      const refundRequests = [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          reason: RefundReason.PERSONAL_SCHEDULE,
          refundAmount: 50000,
          status: 'PENDING',
        },
        {
          id: 2,
          sessionEnrollmentId: 2,
          studentId: 2,
          reason: RefundReason.OTHER,
          refundAmount: 30000,
          status: 'APPROVED',
        },
      ];

      prisma.refundRequest.findMany.mockResolvedValue(refundRequests);

      const result = await service.getAllRefundRequests();

      expect(result).toEqual(refundRequests);
      expect(prisma.refundRequest.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should get all refund requests with status filter', async () => {
      const status = 'PENDING';
      const refundRequests = [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          reason: RefundReason.PERSONAL_SCHEDULE,
          refundAmount: 50000,
          status: 'PENDING',
        },
      ];

      prisma.refundRequest.findMany.mockResolvedValue(refundRequests);

      const result = await service.getAllRefundRequests(status);

      expect(result).toEqual(refundRequests);
      expect(prisma.refundRequest.findMany).toHaveBeenCalledWith({
        where: { status },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('getRefundRequest', () => {
    it('should get a specific refund request successfully', async () => {
      const refundRequestId = 1;
      const refundRequest = {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        reason: RefundReason.PERSONAL_SCHEDULE,
        detailedReason: 'Schedule conflict with another class',
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
        status: 'PENDING',
        sessionEnrollment: {
          id: 1,
          session: {
            id: 1,
            class: {
              id: 1,
              teacher: { id: 1, name: 'Test Teacher' },
            },
          },
          student: { id: 1, name: 'Test Student' },
        },
      };

      prisma.refundRequest.findUnique.mockResolvedValue(refundRequest);

      const result = await service.getRefundRequest(refundRequestId);

      expect(result).toEqual(refundRequest);
      expect(prisma.refundRequest.findUnique).toHaveBeenCalledWith({
        where: { id: refundRequestId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when refund request not found', async () => {
      const refundRequestId = 999;

      prisma.refundRequest.findUnique.mockResolvedValue(null);

      await expect(service.getRefundRequest(refundRequestId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPrincipalRefundRequests', () => {
    it('should get principal refund requests', async () => {
      const principalId = 1;
      const refundRequests = [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          reason: RefundReason.PERSONAL_SCHEDULE,
          refundAmount: 50000,
          status: 'PENDING',
        },
      ];

      prisma.principal.findUnique.mockResolvedValue({
        id: 1,
        academy: { id: 1 },
      });
      prisma.refundRequest.findMany.mockResolvedValue(refundRequests);

      const result = await service.getPrincipalRefundRequests(principalId);

      expect(result).toEqual(refundRequests);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { id: principalId },
        include: { academy: true },
      });
      expect(prisma.refundRequest.findMany).toHaveBeenCalled();
    });
  });

  describe('getPrincipalSessionsWithRefundRequests', () => {
    it('should get principal sessions with refund requests', async () => {
      const principalId = 1;
      const sessions = [
        {
          id: 1,
          class: {
            className: 'Test Class',
          },
          date: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          enrollments: [
            {
              refundRequests: [],
            },
          ],
        },
      ];

      prisma.principal.findUnique.mockResolvedValue({ id: 1, academyId: 1 });
      prisma.classSession.findMany.mockResolvedValue(sessions);

      const expectedResult = [
        {
          id: 1,
          className: 'Test Class',
          sessionDate: sessions[0].date,
          startTime: sessions[0].startTime,
          endTime: sessions[0].endTime,
          requestCount: 0,
          class: {
            level: undefined,
          },
        },
      ];

      const result =
        await service.getPrincipalSessionsWithRefundRequests(principalId);

      expect(result).toEqual(expectedResult);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId: principalId },
        include: { academy: true },
      });
      expect(prisma.classSession.findMany).toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../payment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: any;

  const mockPrisma = {
    payment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sessionEnrollment: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const createPaymentDto: CreatePaymentDto = {
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        status: 'PENDING',
        method: 'CARD',
        paidAt: '2024-01-15T10:00:00.000Z',
      };
      const createdPayment = { id: 1, ...createPaymentDto };

      prisma.sessionEnrollment.findUnique.mockResolvedValue({ id: 1 });
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue(createdPayment);

      const result = await service.createPayment(createPaymentDto);

      expect(result).toEqual(createdPayment);
      expect(prisma.sessionEnrollment.findUnique).toHaveBeenCalledWith({
        where: { id: createPaymentDto.sessionEnrollmentId },
      });
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { sessionEnrollmentId: createPaymentDto.sessionEnrollmentId },
      });
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          sessionEnrollmentId: createPaymentDto.sessionEnrollmentId,
          studentId: createPaymentDto.studentId,
          amount: createPaymentDto.amount,
          status: createPaymentDto.status,
          method: createPaymentDto.method,
          paidAt: createPaymentDto.paidAt,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when session enrollment not found', async () => {
      const createPaymentDto: CreatePaymentDto = {
        sessionEnrollmentId: 999,
        studentId: 1,
        amount: 50000,
        method: 'CARD',
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue(null);

      await expect(service.createPayment(createPaymentDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when payment already exists', async () => {
      const createPaymentDto: CreatePaymentDto = {
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        method: 'CARD',
      };

      prisma.sessionEnrollment.findUnique.mockResolvedValue({ id: 1 });
      prisma.payment.findUnique.mockResolvedValue({ id: 1 }); // 이미 결제가 존재

      await expect(service.createPayment(createPaymentDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should use default status when not provided', async () => {
      const createPaymentDto: CreatePaymentDto = {
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        method: 'CARD',
      };
      const createdPayment = { id: 1, ...createPaymentDto, status: 'PENDING' };

      prisma.sessionEnrollment.findUnique.mockResolvedValue({ id: 1 });
      prisma.payment.findUnique.mockResolvedValue(null);
      prisma.payment.create.mockResolvedValue(createdPayment);

      const result = await service.createPayment(createPaymentDto);

      expect(result).toEqual(createdPayment);
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING', // 기본값 사용
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('getPaymentBySessionEnrollment', () => {
    it('should get payment by session enrollment successfully', async () => {
      const sessionEnrollmentId = 1;
      const payment = {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        status: 'COMPLETED',
        method: 'CARD',
        sessionEnrollment: {
          id: 1,
          session: {
            id: 1,
            class: {
              id: 1,
              teacher: { id: 1, name: 'Test Teacher' },
            },
          },
        },
        student: { id: 1, name: 'Test Student' },
      };

      prisma.payment.findUnique.mockResolvedValue(payment);

      const result =
        await service.getPaymentBySessionEnrollment(sessionEnrollmentId);

      expect(result).toEqual(payment);
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { sessionEnrollmentId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when payment not found', async () => {
      const sessionEnrollmentId = 999;

      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.getPaymentBySessionEnrollment(sessionEnrollmentId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentPayments', () => {
    it('should get student payments successfully', async () => {
      const studentId = 1;
      const payments = [
        {
          id: 1,
          sessionEnrollmentId: 1,
          studentId: 1,
          amount: 50000,
          status: 'COMPLETED',
          method: 'CARD',
          sessionEnrollment: {
            id: 1,
            session: {
              id: 1,
              class: {
                id: 1,
                teacher: { id: 1, name: 'Test Teacher' },
              },
            },
          },
          student: { id: 1, name: 'Test Student' },
        },
        {
          id: 2,
          sessionEnrollmentId: 2,
          studentId: 1,
          amount: 30000,
          status: 'PENDING',
          method: 'BANK_TRANSFER',
          sessionEnrollment: {
            id: 2,
            session: {
              id: 2,
              class: {
                id: 2,
                teacher: { id: 2, name: 'Another Teacher' },
              },
            },
          },
          student: { id: 1, name: 'Test Student' },
        },
      ];

      prisma.payment.findMany.mockResolvedValue(payments);

      const result = await service.getStudentPayments(studentId);

      expect(result).toEqual(payments);
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { studentId },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });

    it('should return empty array when no payments found', async () => {
      const studentId = 999;

      prisma.payment.findMany.mockResolvedValue([]);

      const result = await service.getStudentPayments(studentId);

      expect(result).toEqual([]);
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { studentId },
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
    });
  });

  describe('updatePayment', () => {
    it('should update payment successfully', async () => {
      const sessionEnrollmentId = 1;
      const updatePaymentDto: UpdatePaymentDto = {
        status: 'COMPLETED',
        method: 'CARD',
        paidAt: '2024-01-15T10:00:00.000Z',
      };
      const updatedPayment = {
        id: 1,
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        ...updatePaymentDto,
      };

      prisma.payment.findUnique.mockResolvedValue({ id: 1 });
      prisma.payment.update.mockResolvedValue(updatedPayment);

      const result = await service.updatePayment(
        sessionEnrollmentId,
        updatePaymentDto,
      );

      expect(result).toEqual(updatedPayment);
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { sessionEnrollmentId },
      });
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { sessionEnrollmentId },
        data: updatePaymentDto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when payment not found', async () => {
      const sessionEnrollmentId = 999;
      const updatePaymentDto: UpdatePaymentDto = {
        status: 'COMPLETED',
      };

      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePayment(sessionEnrollmentId, updatePaymentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePayment', () => {
    it('should delete payment successfully', async () => {
      const sessionEnrollmentId = 1;
      const result = { message: '결제가 삭제되었습니다.' };

      prisma.payment.findUnique.mockResolvedValue({ id: 1 });
      prisma.payment.delete.mockResolvedValue({ id: 1 });

      const response = await service.deletePayment(sessionEnrollmentId);

      expect(response).toEqual(result);
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { sessionEnrollmentId },
      });
      expect(prisma.payment.delete).toHaveBeenCalledWith({
        where: { sessionEnrollmentId },
      });
    });

    it('should throw NotFoundException when payment not found', async () => {
      const sessionEnrollmentId = 999;

      prisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.deletePayment(sessionEnrollmentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

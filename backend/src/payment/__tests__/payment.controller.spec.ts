import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../payment.controller';
import { PaymentService } from '../payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  const mockService = {
    createPayment: jest.fn(),
    getPaymentBySessionEnrollment: jest.fn(),
    getStudentPayments: jest.fn(),
    updatePayment: jest.fn(),
    deletePayment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [{ provide: PaymentService, useValue: mockService }],
    }).compile();
    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        sessionEnrollmentId: 1,
        studentId: 1,
        amount: 50000,
        status: 'PENDING',
        method: 'CARD',
        paidAt: '2024-01-15T10:00:00.000Z',
      };
      const createdPayment = { id: 1, ...createPaymentDto };
      mockService.createPayment.mockResolvedValue(createdPayment);

      const result = await controller.createPayment(createPaymentDto);

      expect(result).toEqual(createdPayment);
      expect(service.createPayment).toHaveBeenCalledWith(createPaymentDto);
    });
  });

  describe('getPaymentBySessionEnrollment', () => {
    it('should get payment by session enrollment', async () => {
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
      mockService.getPaymentBySessionEnrollment.mockResolvedValue(payment);

      const result =
        await controller.getPaymentBySessionEnrollment(sessionEnrollmentId);

      expect(result).toEqual(payment);
      expect(service.getPaymentBySessionEnrollment).toHaveBeenCalledWith(
        sessionEnrollmentId,
      );
    });
  });

  describe('getStudentPayments', () => {
    it('should get student payments', async () => {
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
      mockService.getStudentPayments.mockResolvedValue(payments);

      const result = await controller.getStudentPayments(studentId);

      expect(result).toEqual(payments);
      expect(service.getStudentPayments).toHaveBeenCalledWith(studentId);
    });
  });

  describe('updatePayment', () => {
    it('should update payment', async () => {
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
      mockService.updatePayment.mockResolvedValue(updatedPayment);

      const result = await controller.updatePayment(
        sessionEnrollmentId,
        updatePaymentDto,
      );

      expect(result).toEqual(updatedPayment);
      expect(service.updatePayment).toHaveBeenCalledWith(
        sessionEnrollmentId,
        updatePaymentDto,
      );
    });
  });

  describe('deletePayment', () => {
    it('should delete payment', async () => {
      const sessionEnrollmentId = 1;
      const result = { message: '결제가 삭제되었습니다.' };
      mockService.deletePayment.mockResolvedValue(result);

      const response = await controller.deletePayment(sessionEnrollmentId);

      expect(response).toEqual(result);
      expect(service.deletePayment).toHaveBeenCalledWith(sessionEnrollmentId);
    });
  });
});

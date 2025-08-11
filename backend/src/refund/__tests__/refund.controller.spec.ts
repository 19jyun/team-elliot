import { Test, TestingModule } from '@nestjs/testing';
import { RefundController } from '../refund.controller';
import { RefundService } from '../refund.service';
import { RefundRequestDto, RefundReason } from '../dto/refund-request.dto';
import { RefundProcessDto } from '../dto/refund-process.dto';

describe('RefundController', () => {
  let controller: RefundController;
  let service: RefundService;

  const mockService = {
    createRefundRequest: jest.fn(),
    cancelRefundRequest: jest.fn(),
    getStudentRefundRequests: jest.fn(),
    getAllRefundRequests: jest.fn(),
    getRefundRequest: jest.fn(),
  };

  const mockUser = {
    id: 1,
    userId: 'teststudent',
    role: 'STUDENT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundController],
      providers: [{ provide: RefundService, useValue: mockService }],
    }).compile();
    controller = module.get<RefundController>(RefundController);
    service = module.get<RefundService>(RefundService);
    jest.clearAllMocks();
  });

  describe('createRefundRequest', () => {
    it('should create a refund request', async () => {
      const refundRequestDto: RefundRequestDto = {
        sessionEnrollmentId: 1,
        reason: RefundReason.PERSONAL_SCHEDULE,
        detailedReason: 'Schedule conflict with another class',
        refundAmount: 50000,
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Student',
      };
      const createdRefundRequest = {
        id: 1,
        ...refundRequestDto,
        status: 'PENDING',
      };
      mockService.createRefundRequest.mockResolvedValue(createdRefundRequest);

      const result = await controller.createRefundRequest(
        refundRequestDto,
        mockUser,
      );

      expect(result).toEqual(createdRefundRequest);
      expect(service.createRefundRequest).toHaveBeenCalledWith(
        refundRequestDto,
        mockUser.id,
      );
    });
  });

  describe('cancelRefundRequest', () => {
    it('should cancel a refund request', async () => {
      const refundRequestId = 1;
      const result = { message: '환불 요청이 취소되었습니다.' };
      mockService.cancelRefundRequest.mockResolvedValue(result);

      const response = await controller.cancelRefundRequest(
        refundRequestId,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.cancelRefundRequest).toHaveBeenCalledWith(
        refundRequestId,
        mockUser.id,
      );
    });
  });

  describe('getStudentRefundRequests', () => {
    it('should get student refund requests', async () => {
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
      mockService.getStudentRefundRequests.mockResolvedValue(refundRequests);

      const result = await controller.getStudentRefundRequests(mockUser);

      expect(result).toEqual(refundRequests);
      expect(service.getStudentRefundRequests).toHaveBeenCalledWith(
        mockUser.id,
      );
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
      mockService.getAllRefundRequests.mockResolvedValue(refundRequests);

      const result = await controller.getAllRefundRequests();

      expect(result).toEqual(refundRequests);
      expect(service.getAllRefundRequests).toHaveBeenCalledWith(undefined);
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
      mockService.getAllRefundRequests.mockResolvedValue(refundRequests);

      const result = await controller.getAllRefundRequests(status);

      expect(result).toEqual(refundRequests);
      expect(service.getAllRefundRequests).toHaveBeenCalledWith(status);
    });
  });

  describe('getRefundRequest', () => {
    it('should get a specific refund request', async () => {
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
      mockService.getRefundRequest.mockResolvedValue(refundRequest);

      const result = await controller.getRefundRequest(refundRequestId);

      expect(result).toEqual(refundRequest);
      expect(service.getRefundRequest).toHaveBeenCalledWith(refundRequestId);
    });
  });
});

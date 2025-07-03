import { Test, TestingModule } from '@nestjs/testing';
import { BankingController } from '../banking.controller';
import { BankingService } from '../banking.service';
import { BankAccountInfo } from '../banking.service';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';

describe('BankingController', () => {
  let controller: BankingController;
  let service: BankingService;

  const mockBankAccountInfo: BankAccountInfo = {
    id: 1,
    bankName: '신한은행',
    accountNumber: '123-456-789012',
    accountHolder: '김강사',
    teacherId: 1,
  };

  const mockCreateDto: CreateBankAccountDto = {
    bankName: '신한은행',
    accountNumber: '123-456-789012',
    accountHolder: '김강사',
    teacherId: 1,
  };

  const mockUpdateDto: UpdateBankAccountDto = {
    bankName: '국민은행',
  };

  const mockBankingService = {
    getTeacherBankAccount: jest.fn(),
    getTeacherWithBankAccount: jest.fn(),
    createBankAccount: jest.fn(),
    updateBankAccount: jest.fn(),
    deleteBankAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankingController],
      providers: [
        {
          provide: BankingService,
          useValue: mockBankingService,
        },
      ],
    }).compile();

    controller = module.get<BankingController>(BankingController);
    service = module.get<BankingService>(BankingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeacherBankAccount', () => {
    it('should return bank account information for a teacher', async () => {
      const teacherId = 1;
      mockBankingService.getTeacherBankAccount.mockResolvedValue(
        mockBankAccountInfo,
      );

      const result = await controller.getTeacherBankAccount(teacherId);

      expect(service.getTeacherBankAccount).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockBankAccountInfo);
    });
  });

  describe('getTeacherWithBankAccount', () => {
    it('should return teacher with bank account information', async () => {
      const teacherId = 1;
      const mockTeacherWithBankAccount = {
        id: 1,
        userId: 'teacher1',
        name: '김강사',
        bankAccount: mockBankAccountInfo,
      };
      mockBankingService.getTeacherWithBankAccount.mockResolvedValue(
        mockTeacherWithBankAccount,
      );

      const result = await controller.getTeacherWithBankAccount(teacherId);

      expect(service.getTeacherWithBankAccount).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockTeacherWithBankAccount);
    });
  });

  describe('createBankAccount', () => {
    it('should create a new bank account for a teacher', async () => {
      const teacherId = 1;
      const createDto = { ...mockCreateDto, teacherId };
      mockBankingService.createBankAccount.mockResolvedValue(
        mockBankAccountInfo,
      );

      const result = await controller.createBankAccount(
        teacherId,
        mockCreateDto,
      );

      expect(service.createBankAccount).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockBankAccountInfo);
    });

    it('should inject teacherId into the DTO', async () => {
      const teacherId = 1;
      const createDto = { ...mockCreateDto, teacherId };
      mockBankingService.createBankAccount.mockResolvedValue(
        mockBankAccountInfo,
      );

      await controller.createBankAccount(teacherId, mockCreateDto);

      expect(service.createBankAccount).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateBankAccount', () => {
    it('should update bank account information for a teacher', async () => {
      const teacherId = 1;
      const updatedBankAccount = {
        ...mockBankAccountInfo,
        bankName: '국민은행',
      };
      mockBankingService.updateBankAccount.mockResolvedValue(
        updatedBankAccount,
      );

      const result = await controller.updateBankAccount(
        teacherId,
        mockUpdateDto,
      );

      expect(service.updateBankAccount).toHaveBeenCalledWith(
        teacherId,
        mockUpdateDto,
      );
      expect(result).toEqual(updatedBankAccount);
    });

    it('should handle partial updates', async () => {
      const teacherId = 1;
      const partialUpdateDto = { accountNumber: '987-654-321098' };
      const updatedBankAccount = {
        ...mockBankAccountInfo,
        accountNumber: '987-654-321098',
      };
      mockBankingService.updateBankAccount.mockResolvedValue(
        updatedBankAccount,
      );

      const result = await controller.updateBankAccount(
        teacherId,
        partialUpdateDto,
      );

      expect(service.updateBankAccount).toHaveBeenCalledWith(
        teacherId,
        partialUpdateDto,
      );
      expect(result).toEqual(updatedBankAccount);
    });
  });

  describe('deleteBankAccount', () => {
    it('should delete bank account for a teacher', async () => {
      const teacherId = 1;
      const deleteResult = { deleted: true };
      mockBankingService.deleteBankAccount.mockResolvedValue(deleteResult);

      const result = await controller.deleteBankAccount(teacherId);

      expect(service.deleteBankAccount).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(deleteResult);
    });
  });
});

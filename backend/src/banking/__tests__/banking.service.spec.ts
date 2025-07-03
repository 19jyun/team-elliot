import { Test, TestingModule } from '@nestjs/testing';
import { BankingService } from '../banking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';

describe('BankingService', () => {
  let service: BankingService;
  let prismaService: PrismaService;

  const mockBankAccount = {
    id: 1,
    bankName: '신한은행',
    accountNumber: '123-456-789012',
    accountHolder: '김강사',
    teacherId: 1,
  };

  const mockTeacher = {
    id: 1,
    userId: 'teacher1',
    name: '김강사',
    bankAccount: mockBankAccount,
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

  const mockPrismaService = {
    bankAccount: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BankingService>(BankingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeacherBankAccount', () => {
    it('should return bank account information for a valid teacher ID', async () => {
      const teacherId = 1;
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(
        mockBankAccount,
      );

      const result = await service.getTeacherBankAccount(teacherId);

      expect(prismaService.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { teacherId },
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountHolder: true,
          teacherId: true,
        },
      });
      expect(result).toEqual(mockBankAccount);
    });

    it('should throw NotFoundException when teacher has no bank account', async () => {
      const teacherId = 1;
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.getTeacherBankAccount(teacherId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTeacherBankAccount(teacherId)).rejects.toThrow(
        `Teacher with ID ${teacherId} has no bank account information`,
      );
    });
  });

  describe('getTeacherWithBankAccount', () => {
    it('should return teacher with bank account information', async () => {
      const teacherId = 1;
      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await service.getTeacherWithBankAccount(teacherId);

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
        include: {
          bankAccount: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true,
              accountHolder: true,
            },
          },
        },
      });
      expect(result).toEqual(mockTeacher);
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const teacherId = 999;
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.getTeacherWithBankAccount(teacherId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getTeacherWithBankAccount(teacherId),
      ).rejects.toThrow(`Teacher with ID ${teacherId} not found`);
    });
  });

  describe('createBankAccount', () => {
    it('should create a new bank account successfully', async () => {
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(null);
      mockPrismaService.bankAccount.create.mockResolvedValue(mockBankAccount);

      const result = await service.createBankAccount(mockCreateDto);

      expect(prismaService.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { teacherId: mockCreateDto.teacherId },
      });
      expect(prismaService.bankAccount.create).toHaveBeenCalledWith({
        data: {
          bankName: mockCreateDto.bankName,
          accountNumber: mockCreateDto.accountNumber,
          accountHolder: mockCreateDto.accountHolder,
          teacherId: mockCreateDto.teacherId,
        },
      });
      expect(result).toEqual(mockBankAccount);
    });

    it('should throw error when teacher already has a bank account', async () => {
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(
        mockBankAccount,
      );

      await expect(service.createBankAccount(mockCreateDto)).rejects.toThrow(
        '해당 강사는 이미 계좌 정보가 존재합니다.',
      );
    });
  });

  describe('updateBankAccount', () => {
    it('should update bank account successfully', async () => {
      const teacherId = 1;
      const updatedBankAccount = { ...mockBankAccount, bankName: '국민은행' };

      mockPrismaService.bankAccount.findUnique.mockResolvedValue(
        mockBankAccount,
      );
      mockPrismaService.bankAccount.update.mockResolvedValue(
        updatedBankAccount,
      );

      const result = await service.updateBankAccount(teacherId, mockUpdateDto);

      expect(prismaService.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { teacherId },
      });
      expect(prismaService.bankAccount.update).toHaveBeenCalledWith({
        where: { teacherId },
        data: mockUpdateDto,
      });
      expect(result).toEqual(updatedBankAccount);
    });

    it('should handle partial updates', async () => {
      const teacherId = 1;
      const partialUpdateDto = { accountNumber: '987-654-321098' };
      const updatedBankAccount = {
        ...mockBankAccount,
        accountNumber: '987-654-321098',
      };

      mockPrismaService.bankAccount.findUnique.mockResolvedValue(
        mockBankAccount,
      );
      mockPrismaService.bankAccount.update.mockResolvedValue(
        updatedBankAccount,
      );

      const result = await service.updateBankAccount(
        teacherId,
        partialUpdateDto,
      );

      expect(prismaService.bankAccount.update).toHaveBeenCalledWith({
        where: { teacherId },
        data: partialUpdateDto,
      });
      expect(result).toEqual(updatedBankAccount);
    });

    it('should throw NotFoundException when bank account does not exist', async () => {
      const teacherId = 1;
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(null);

      await expect(
        service.updateBankAccount(teacherId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateBankAccount(teacherId, mockUpdateDto),
      ).rejects.toThrow('계좌 정보가 존재하지 않습니다.');
    });
  });

  describe('deleteBankAccount', () => {
    it('should delete bank account successfully', async () => {
      const teacherId = 1;
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(
        mockBankAccount,
      );
      mockPrismaService.bankAccount.delete.mockResolvedValue(mockBankAccount);

      const result = await service.deleteBankAccount(teacherId);

      expect(prismaService.bankAccount.findUnique).toHaveBeenCalledWith({
        where: { teacherId },
      });
      expect(prismaService.bankAccount.delete).toHaveBeenCalledWith({
        where: { teacherId },
      });
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when bank account does not exist', async () => {
      const teacherId = 1;
      mockPrismaService.bankAccount.findUnique.mockResolvedValue(null);

      await expect(service.deleteBankAccount(teacherId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteBankAccount(teacherId)).rejects.toThrow(
        '계좌 정보가 존재하지 않습니다.',
      );
    });
  });
});

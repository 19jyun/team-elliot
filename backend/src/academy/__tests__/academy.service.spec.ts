import { Test, TestingModule } from '@nestjs/testing';
import { AcademyService } from '../academy.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAcademyDto, JoinAcademyDto, LeaveAcademyDto } from '../dto';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('AcademyService', () => {
  let service: AcademyService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    academy: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    studentAcademy: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    class: {
      deleteMany: jest.fn(),
    },
    classSession: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AcademyService>(AcademyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAcademy', () => {
    it('should create academy successfully', async () => {
      const createAcademyDto: CreateAcademyDto = {
        name: '테스트 학원',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구',
        description: '테스트 학원입니다.',
        code: 'TEST001',
      };

      const expectedAcademy = {
        id: 1,
        ...createAcademyDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.academy.findUnique.mockResolvedValue(null);
      mockPrismaService.academy.create.mockResolvedValue(expectedAcademy);

      const result = await service.createAcademy(createAcademyDto);

      expect(prismaService.academy.findUnique).toHaveBeenCalledWith({
        where: { code: createAcademyDto.code },
      });
      expect(prismaService.academy.create).toHaveBeenCalledWith({
        data: createAcademyDto,
      });
      expect(result).toEqual(expectedAcademy);
    });

    it('should throw ConflictException when academy code already exists', async () => {
      const createAcademyDto: CreateAcademyDto = {
        name: '테스트 학원',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구',
        description: '테스트 학원입니다.',
        code: 'TEST001',
      };

      mockPrismaService.academy.findUnique.mockResolvedValue({
        id: 1,
        code: 'TEST001',
      });

      await expect(service.createAcademy(createAcademyDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.academy.findUnique).toHaveBeenCalledWith({
        where: { code: createAcademyDto.code },
      });
    });
  });

  describe('deleteAcademy', () => {
    it('should delete academy successfully when no teachers and students', async () => {
      const academyId = 1;
      const mockAcademy = {
        id: academyId,
        name: '테스트 학원',
        classes: [],
        teachers: [],
        students: [],
      };

      mockPrismaService.academy.findUnique.mockResolvedValue(mockAcademy);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback({
          ...mockPrismaService,
          classSession: { deleteMany: jest.fn().mockResolvedValue({}) },
          class: { deleteMany: jest.fn().mockResolvedValue({}) },
          academy: {
            ...mockPrismaService.academy,
            delete: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await service.deleteAcademy(academyId);

      expect(prismaService.academy.findUnique).toHaveBeenCalledWith({
        where: { id: academyId },
        include: {
          classes: { include: { classSessions: true } },
          teachers: true,
          students: true,
        },
      });
      expect(result).toEqual({ message: '학원이 성공적으로 삭제되었습니다.' });
    });

    it('should throw NotFoundException when academy not found', async () => {
      const academyId = 999;

      mockPrismaService.academy.findUnique.mockResolvedValue(null);

      await expect(service.deleteAcademy(academyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when academy has teachers', async () => {
      const academyId = 1;
      const mockAcademy = {
        id: academyId,
        name: '테스트 학원',
        classes: [],
        teachers: [{ id: 1, name: '선생님' }],
        students: [],
      };

      mockPrismaService.academy.findUnique.mockResolvedValue(mockAcademy);

      await expect(service.deleteAcademy(academyId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when academy has students', async () => {
      const academyId = 1;
      const mockAcademy = {
        id: academyId,
        name: '테스트 학원',
        classes: [],
        teachers: [],
        students: [{ id: 1, name: '학생' }],
      };

      mockPrismaService.academy.findUnique.mockResolvedValue(mockAcademy);

      await expect(service.deleteAcademy(academyId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAcademies', () => {
    it('should return all academies', async () => {
      const expectedAcademies = [
        {
          id: 1,
          name: '테스트 학원 1',
          phoneNumber: '02-1234-5678',
          address: '서울시 강남구',
          description: '테스트 학원 1입니다.',
          code: 'TEST001',
        },
        {
          id: 2,
          name: '테스트 학원 2',
          phoneNumber: '02-2345-6789',
          address: '서울시 서초구',
          description: '테스트 학원 2입니다.',
          code: 'TEST002',
        },
      ];

      mockPrismaService.academy.findMany.mockResolvedValue(expectedAcademies);

      const result = await service.getAcademies();

      expect(prismaService.academy.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedAcademies);
    });
  });

  describe('getAcademyById', () => {
    it('should return academy by id', async () => {
      const academyId = 1;
      const expectedAcademy = {
        id: academyId,
        name: '테스트 학원',
        phoneNumber: '02-1234-5678',
        address: '서울시 강남구',
        description: '테스트 학원입니다.',
        code: 'TEST001',
      };

      mockPrismaService.academy.findUnique.mockResolvedValue(expectedAcademy);

      const result = await service.getAcademyById(academyId);

      expect(prismaService.academy.findUnique).toHaveBeenCalledWith({
        where: { id: academyId },
      });
      expect(result).toEqual(expectedAcademy);
    });

    it('should throw NotFoundException when academy not found', async () => {
      const academyId = 999;

      mockPrismaService.academy.findUnique.mockResolvedValue(null);

      await expect(service.getAcademyById(academyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('joinAcademy', () => {
    it('should join academy successfully', async () => {
      const studentId = 1;
      const joinAcademyDto: JoinAcademyDto = {
        code: 'TEST001',
      };

      const mockAcademy = {
        id: 1,
        name: '테스트 학원',
        code: 'TEST001',
      };

      const mockStudent = {
        id: 1,
        userRefId: studentId,
        name: '테스트 학생',
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.academy.findUnique.mockResolvedValue(mockAcademy);
      mockPrismaService.studentAcademy.findUnique.mockResolvedValue(null);
      mockPrismaService.studentAcademy.create.mockResolvedValue({
        studentId: mockStudent.id,
        academyId: mockAcademy.id,
      });

      const result = await service.joinAcademy(studentId, joinAcademyDto);

      expect(prismaService.academy.findUnique).toHaveBeenCalledWith({
        where: { code: joinAcademyDto.code },
      });
      expect(prismaService.studentAcademy.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_academyId: {
            studentId: mockStudent.id,
            academyId: mockAcademy.id,
          },
        },
      });
      expect(prismaService.studentAcademy.create).toHaveBeenCalledWith({
        data: { studentId: mockStudent.id, academyId: mockAcademy.id },
      });
      expect(result).toEqual({ message: '학원 가입이 완료되었습니다.' });
    });

    it('should throw NotFoundException when academy code not found', async () => {
      const studentId = 1;
      const joinAcademyDto: JoinAcademyDto = {
        code: 'INVALID_CODE',
      };

      mockPrismaService.academy.findUnique.mockResolvedValue(null);

      await expect(
        service.joinAcademy(studentId, joinAcademyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already joined academy', async () => {
      const studentId = 1;
      const joinAcademyDto: JoinAcademyDto = {
        code: 'TEST001',
      };

      const mockAcademy = {
        id: 1,
        name: '테스트 학원',
        code: 'TEST001',
      };

      const mockStudent = {
        id: 1,
        userRefId: studentId,
        name: '테스트 학생',
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.academy.findUnique.mockResolvedValue(mockAcademy);
      mockPrismaService.studentAcademy.findUnique.mockResolvedValue({
        studentId: mockStudent.id,
        academyId: mockAcademy.id,
      });

      await expect(
        service.joinAcademy(studentId, joinAcademyDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('leaveAcademy', () => {
    it('should leave academy successfully', async () => {
      const studentId = 1;
      const leaveAcademyDto: LeaveAcademyDto = {
        academyId: 1,
      };

      const mockStudent = {
        id: 1,
        userRefId: studentId,
        name: '테스트 학생',
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.studentAcademy.findUnique.mockResolvedValue({
        studentId: mockStudent.id,
        academyId: leaveAcademyDto.academyId,
      });
      mockPrismaService.studentAcademy.delete.mockResolvedValue({
        studentId: mockStudent.id,
        academyId: leaveAcademyDto.academyId,
      });

      const result = await service.leaveAcademy(studentId, leaveAcademyDto);

      expect(prismaService.studentAcademy.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_academyId: {
            studentId: mockStudent.id,
            academyId: leaveAcademyDto.academyId,
          },
        },
      });
      expect(prismaService.studentAcademy.delete).toHaveBeenCalledWith({
        where: {
          studentId_academyId: {
            studentId: mockStudent.id,
            academyId: leaveAcademyDto.academyId,
          },
        },
      });
      expect(result).toEqual({ message: '학원 탈퇴가 완료되었습니다.' });
    });

    it('should throw BadRequestException when not joined academy', async () => {
      const studentId = 1;
      const leaveAcademyDto: LeaveAcademyDto = {
        academyId: 1,
      };

      const mockStudent = {
        id: 1,
        userRefId: studentId,
        name: '테스트 학생',
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.studentAcademy.findUnique.mockResolvedValue(null);

      await expect(
        service.leaveAcademy(studentId, leaveAcademyDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyAcademies', () => {
    it('should return my academies successfully', async () => {
      const studentId = 1;
      const mockStudent = {
        id: studentId,
        name: '테스트 학생',
        academies: [
          {
            academy: {
              id: 1,
              name: '테스트 학원 1',
              phoneNumber: '02-1234-5678',
              address: '서울시 강남구',
              description: '테스트 학원 1입니다.',
              code: 'TEST001',
            },
          },
        ],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.getMyAcademies(studentId);

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userRefId: studentId },
        include: {
          academies: {
            include: { academy: true },
          },
        },
      });
      expect(result).toEqual(mockStudent.academies.map((sa) => sa.academy));
    });

    it('should throw NotFoundException when student not found', async () => {
      const studentId = 999;

      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.getMyAcademies(studentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

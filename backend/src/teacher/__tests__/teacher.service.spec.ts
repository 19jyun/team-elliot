import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeacherService } from '../teacher.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassService } from '../../class/class.service';
import { AcademyService } from '../../academy/academy.service';

describe('TeacherService', () => {
  let service: TeacherService;
  let prismaService: PrismaService;
  let classService: ClassService;
  let academyService: AcademyService;

  const mockPrismaService = {
    teacher: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockClassService = {
    createClass: jest.fn(),
  };

  const mockAcademyService = {
    joinAcademy: jest.fn(),
    leaveAcademy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ClassService,
          useValue: mockClassService,
        },
        {
          provide: AcademyService,
          useValue: mockAcademyService,
        },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
    prismaService = module.get<PrismaService>(PrismaService);
    classService = module.get<ClassService>(ClassService);
    academyService = module.get<AcademyService>(AcademyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeacherProfile', () => {
    it('should return teacher profile successfully', async () => {
      const userRefId = 1;
      const mockTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        name: '김선생님',
        phoneNumber: '010-1234-5678',
        introduction: '수학 전문가입니다.',
        photoUrl: 'https://example.com/photo.jpg',
        education: undefined,
        specialties: undefined,
        certifications: undefined,
        yearsOfExperience: undefined,
        availableTimes: undefined,
        academy: null,
        createdAt: undefined,
        updatedAt: undefined,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await service.getTeacherProfile(userRefId);

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
        select: {
          id: true,
          userId: true,
          name: true,
          phoneNumber: true,
          introduction: true,
          photoUrl: true,
          education: true,
          specialties: true,
          certifications: true,
          yearsOfExperience: true,
          availableTimes: true,
          createdAt: true,
          updatedAt: true,
          academy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(result).toEqual({
        id: mockTeacher.id,
        userId: mockTeacher.userId,
        name: mockTeacher.name,
        phoneNumber: mockTeacher.phoneNumber,
        introduction: mockTeacher.introduction,
        photoUrl: mockTeacher.photoUrl,
        education: mockTeacher.education,
        specialties: mockTeacher.specialties,
        certifications: mockTeacher.certifications,
        yearsOfExperience: mockTeacher.yearsOfExperience,
        availableTimes: mockTeacher.availableTimes,
        academyId: null,
        academy: null,
        createdAt: mockTeacher.createdAt,
        updatedAt: mockTeacher.updatedAt,
      });
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const userRefId = 999;

      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(service.getTeacherProfile(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update teacher profile successfully', async () => {
      const userRefId = 1;
      const updateData = {
        name: 'Updated Teacher',
        phoneNumber: '010-9876-5432',
        introduction: 'Updated introduction',
      };
      const updatedTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        name: 'Updated Teacher',
        phoneNumber: '010-9876-5432',
        introduction: 'Updated introduction',
        photoUrl: null,
        education: null,
        specialties: null,
        certifications: null,
        yearsOfExperience: null,
        availableTimes: [],
        academy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue({
        id: 1,
        userRefId,
      });
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          teacher: {
            update: jest.fn().mockResolvedValue(updatedTeacher),
          },
          user: {
            update: jest
              .fn()
              .mockResolvedValue({ id: userRefId, name: 'Updated Teacher' }),
          },
        };
        return await callback(mockTx);
      });

      const result = await service.updateProfile(userRefId, updateData);

      expect(result).toEqual({
        id: updatedTeacher.id,
        userId: updatedTeacher.userId,
        name: updatedTeacher.name,
        phoneNumber: updatedTeacher.phoneNumber,
        introduction: updatedTeacher.introduction,
        photoUrl: updatedTeacher.photoUrl,
        education: updatedTeacher.education,
        specialties: updatedTeacher.specialties,
        certifications: updatedTeacher.certifications,
        yearsOfExperience: updatedTeacher.yearsOfExperience,
        availableTimes: updatedTeacher.availableTimes,
        academyId: null,
        academy: null,
        createdAt: updatedTeacher.createdAt,
        updatedAt: updatedTeacher.updatedAt,
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const userRefId = 999;
      const updateData = { name: 'Updated Teacher' };

      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile(userRefId, updateData),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

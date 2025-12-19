import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeacherService } from '../teacher.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassService } from '../../class/class.service';
import { AcademyService } from '../../academy/academy.service';
import { FileUtil } from '../../common/utils/file.util';

// FileUtil 모킹
jest.mock('../../common/utils/file.util');

describe('TeacherService', () => {
  let service: TeacherService;
  let prismaService: PrismaService;

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

  describe('updateProfilePhoto', () => {
    const mockFile = {
      filename: 'new-photo-123456.jpg',
      originalname: 'profile.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete old photo and update with new photo', async () => {
      const userRefId = 1;
      const oldPhotoUrl = '/uploads/teacher-photos/old-photo.jpg';
      const mockTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        photoUrl: oldPhotoUrl,
      };

      const updatedTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        name: '김선생님',
        phoneNumber: '010-1234-5678',
        introduction: '수학 전문가입니다.',
        photoUrl: '/uploads/teacher-photos/new-photo-123456.jpg',
        education: [],
        specialties: [],
        certifications: [],
        yearsOfExperience: 5,
        availableTimes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        academy: null,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.teacher.update.mockResolvedValue(updatedTeacher);
      (FileUtil.deleteProfilePhoto as jest.Mock).mockReturnValue(true);

      const result = await service.updateProfilePhoto(userRefId, mockFile);

      // 기존 사진 삭제 확인
      expect(FileUtil.deleteProfilePhoto).toHaveBeenCalledWith(oldPhotoUrl);

      // 새 사진 URL로 업데이트 확인
      expect(mockPrismaService.teacher.update).toHaveBeenCalledWith({
        where: { userRefId },
        data: {
          photoUrl: '/uploads/teacher-photos/new-photo-123456.jpg',
          updatedAt: expect.any(Date),
        },
        select: expect.any(Object),
      });

      expect(result.photoUrl).toBe(
        '/uploads/teacher-photos/new-photo-123456.jpg',
      );
    });

    it('should not call delete if no existing photo', async () => {
      const userRefId = 1;
      const mockTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        photoUrl: null,
      };

      const updatedTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        name: '김선생님',
        phoneNumber: '010-1234-5678',
        introduction: null,
        photoUrl: '/uploads/teacher-photos/new-photo-123456.jpg',
        education: [],
        specialties: [],
        certifications: [],
        yearsOfExperience: null,
        availableTimes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        academy: null,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.teacher.update.mockResolvedValue(updatedTeacher);

      await service.updateProfilePhoto(userRefId, mockFile);

      // photoUrl이 null이므로 삭제 호출 안됨
      expect(FileUtil.deleteProfilePhoto).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const userRefId = 999;

      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfilePhoto(userRefId, mockFile),
      ).rejects.toThrow(NotFoundException);

      expect(FileUtil.deleteProfilePhoto).not.toHaveBeenCalled();
    });

    it('should continue update even if file deletion fails', async () => {
      const userRefId = 1;
      const oldPhotoUrl = '/uploads/teacher-photos/old-photo.jpg';
      const mockTeacher = {
        id: 1,
        userRefId,
        photoUrl: oldPhotoUrl,
      };

      const updatedTeacher = {
        id: 1,
        userRefId,
        userId: 1,
        name: '김선생님',
        phoneNumber: '010-1234-5678',
        introduction: null,
        photoUrl: '/uploads/teacher-photos/new-photo-123456.jpg',
        education: [],
        specialties: [],
        certifications: [],
        yearsOfExperience: null,
        availableTimes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        academy: null,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.teacher.update.mockResolvedValue(updatedTeacher);
      (FileUtil.deleteProfilePhoto as jest.Mock).mockReturnValue(false); // 삭제 실패

      const result = await service.updateProfilePhoto(userRefId, mockFile);

      // 삭제는 실패했지만 업데이트는 진행
      expect(FileUtil.deleteProfilePhoto).toHaveBeenCalled();
      expect(mockPrismaService.teacher.update).toHaveBeenCalled();
      expect(result.photoUrl).toBe(
        '/uploads/teacher-photos/new-photo-123456.jpg',
      );
    });
  });
});

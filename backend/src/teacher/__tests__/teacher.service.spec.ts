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
      const teacherId = 1;
      const mockTeacher = {
        id: teacherId,
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
        academyId: null,
        academy: null,
        createdAt: undefined,
        updatedAt: undefined,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await service.getTeacherProfile(teacherId);

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
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
      expect(result).toEqual(mockTeacher);
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const teacherId = 999;
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(service.getTeacherProfile(teacherId)).rejects.toThrow(
        new NotFoundException('선생님을 찾을 수 없습니다.'),
      );
    });
  });

  describe('updateProfile', () => {
    it('should update teacher profile with text data only', async () => {
      const teacherId = 1;
      const updateData = { introduction: '새로운 소개입니다.' };
      const mockTeacher = {
        id: teacherId,
        userId: 1,
        name: '김선생님',
        phoneNumber: undefined,
        introduction: '새로운 소개입니다.',
        photoUrl: undefined,
        education: undefined,
        specialties: undefined,
        certifications: undefined,
        yearsOfExperience: undefined,
        availableTimes: undefined,
        academyId: null,
        academy: null,
        createdAt: undefined,
        updatedAt: undefined,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.teacher.update.mockResolvedValue(mockTeacher);

      const result = await service.updateProfile(teacherId, updateData);

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
      });
      expect(prismaService.teacher.update).toHaveBeenCalledWith({
        where: { id: teacherId },
        data: {
          ...updateData,
          updatedAt: expect.any(Date),
        },
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
      expect(result).toEqual(mockTeacher);
    });

    it('should update teacher profile with photo', async () => {
      const teacherId = 1;
      const updateData = { introduction: '새로운 소개입니다.' };
      const mockPhoto = {
        filename: 'test-photo.jpg',
      } as Express.Multer.File;
      const mockTeacher = {
        id: teacherId,
        userId: 1,
        name: '김선생님',
        phoneNumber: undefined,
        introduction: '새로운 소개입니다.',
        photoUrl: '/uploads/profile-photos/test-photo.jpg',
        education: undefined,
        specialties: undefined,
        certifications: undefined,
        yearsOfExperience: undefined,
        availableTimes: undefined,
        academyId: null,
        academy: null,
        createdAt: undefined,
        updatedAt: undefined,
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrismaService.teacher.update.mockResolvedValue(mockTeacher);

      const result = await service.updateProfilePhoto(teacherId, mockPhoto);

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
      });
      expect(prismaService.teacher.update).toHaveBeenCalledWith({
        where: { id: teacherId },
        data: {
          photoUrl: '/uploads/teacher-photos/test-photo.jpg',
          updatedAt: expect.any(Date),
        },
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
      expect(result).toEqual(mockTeacher);
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const teacherId = 999;
      const updateData = { introduction: '새로운 소개입니다.' };

      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile(teacherId, updateData),
      ).rejects.toThrow(new NotFoundException('선생님을 찾을 수 없습니다.'));
    });
  });

  describe('getTeacherClasses', () => {
    it('should return teacher classes successfully', async () => {
      const teacherId = 1;
      const mockTeacher = {
        id: teacherId,
        classes: [
          {
            id: 1,
            className: '수학',
            description: '기초 수학',
            maxStudents: 20,
            enrollments: [
              {
                id: 1,
                student: {
                  id: 1,
                  name: '학생1',
                },
              },
              {
                id: 2,
                student: {
                  id: 2,
                  name: '학생2',
                },
              },
            ],
          },
          {
            id: 2,
            className: '영어',
            description: '기초 영어',
            maxStudents: 15,
            enrollments: [
              {
                id: 3,
                student: {
                  id: 3,
                  name: '학생3',
                },
              },
            ],
          },
        ],
      };

      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await service.getTeacherClasses(teacherId);

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
        include: {
          classes: {
            include: {
              enrollments: {
                include: {
                  student: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockTeacher.classes);
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const teacherId = 999;
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);

      await expect(service.getTeacherClasses(teacherId)).rejects.toThrow(
        new NotFoundException('선생님을 찾을 수 없습니다.'),
      );
    });
  });
});

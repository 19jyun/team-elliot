import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from '../teacher.controller';
import { TeacherService } from '../teacher.service';

describe('TeacherController', () => {
  let controller: TeacherController;
  let teacherService: TeacherService;

  const mockTeacherService = {
    getTeacherProfile: jest.fn(),
    updateProfile: jest.fn(),
    getTeacherClasses: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherController],
      providers: [
        {
          provide: TeacherService,
          useValue: mockTeacherService,
        },
      ],
    }).compile();

    controller = module.get<TeacherController>(TeacherController);
    teacherService = module.get<TeacherService>(TeacherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeacherProfile', () => {
    it('should return teacher profile successfully', async () => {
      const teacherId = 1;
      const mockTeacherProfile = {
        id: teacherId,
        name: '김선생님',
        phoneNumber: '010-1234-5678',
        introduction: '수학 전문가입니다.',
        photoUrl: 'https://example.com/photo.jpg',
      };

      mockTeacherService.getTeacherProfile.mockResolvedValue(
        mockTeacherProfile,
      );

      const result = await controller.getTeacherProfile(teacherId);

      expect(teacherService.getTeacherProfile).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockTeacherProfile);
    });

    it('should handle numeric teacher ID correctly', async () => {
      const teacherId = 123;
      const mockTeacherProfile = { id: teacherId, name: '테스트 선생님' };

      mockTeacherService.getTeacherProfile.mockResolvedValue(
        mockTeacherProfile,
      );

      await controller.getTeacherProfile(teacherId);

      expect(teacherService.getTeacherProfile).toHaveBeenCalledWith(teacherId);
    });
  });

  describe('updateProfile', () => {
    it('should update teacher profile with text data only', async () => {
      const teacherId = 1;
      const updateData = { introduction: '새로운 소개입니다.' };
      const mockUpdatedProfile = {
        id: teacherId,
        name: '김선생님',
        introduction: '새로운 소개입니다.',
      };

      mockTeacherService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await controller.updateProfile(teacherId, updateData);

      expect(teacherService.updateProfile).toHaveBeenCalledWith(
        teacherId,
        updateData,
        undefined,
      );
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should update teacher profile with photo', async () => {
      const teacherId = 1;
      const updateData = { introduction: '새로운 소개입니다.' };
      const mockPhoto = {
        filename: 'test-photo.jpg',
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;
      const mockUpdatedProfile = {
        id: teacherId,
        name: '김선생님',
        introduction: '새로운 소개입니다.',
        photoUrl: '/uploads/profile-photos/test-photo.jpg',
      };

      mockTeacherService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await controller.updateProfile(
        teacherId,
        updateData,
        mockPhoto,
      );

      expect(teacherService.updateProfile).toHaveBeenCalledWith(
        teacherId,
        updateData,
        mockPhoto,
      );
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should handle numeric teacher ID correctly', async () => {
      const teacherId = 456;
      const updateData = { introduction: '테스트 소개' };
      const mockUpdatedProfile = { id: teacherId, introduction: '테스트 소개' };

      mockTeacherService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      await controller.updateProfile(teacherId, updateData);

      expect(teacherService.updateProfile).toHaveBeenCalledWith(
        teacherId,
        updateData,
        undefined,
      );
    });
  });

  describe('getTeacherClasses', () => {
    it('should return teacher classes successfully', async () => {
      const teacherId = 1;
      const mockClasses = [
        {
          id: 1,
          name: '수학',
          description: '기초 수학',
          maxStudents: 20,
          currentStudents: 15,
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
          name: '영어',
          description: '기초 영어',
          maxStudents: 15,
          currentStudents: 10,
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
      ];

      mockTeacherService.getTeacherClasses.mockResolvedValue(mockClasses);

      const result = await controller.getTeacherClasses(teacherId);

      expect(teacherService.getTeacherClasses).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockClasses);
    });

    it('should handle numeric teacher ID correctly', async () => {
      const teacherId = 789;
      const mockClasses = [
        {
          id: 1,
          name: '테스트 수업',
          enrollments: [],
        },
      ];

      mockTeacherService.getTeacherClasses.mockResolvedValue(mockClasses);

      await controller.getTeacherClasses(teacherId);

      expect(teacherService.getTeacherClasses).toHaveBeenCalledWith(teacherId);
    });
  });
});

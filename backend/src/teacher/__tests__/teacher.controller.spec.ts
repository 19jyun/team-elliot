import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from '../teacher.controller';
import { TeacherService } from '../teacher.service';
import { JoinAcademyRequestDto } from '../../academy/dto/join-academy-request.dto';

describe('TeacherController', () => {
  let controller: TeacherController;
  let service: TeacherService;

  const mockService = {
    getTeacherProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateProfilePhoto: jest.fn(),
    getTeacherData: jest.fn(),
    getTeacherClasses: jest.fn(),
    getTeacherClassesWithSessions: jest.fn(),
    getMyAcademy: jest.fn(),
    changeAcademy: jest.fn(),
    requestJoinAcademy: jest.fn(),
    leaveAcademy: jest.fn(),
  };

  const mockUser = {
    id: 1,
    role: 'TEACHER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherController],
      providers: [{ provide: TeacherService, useValue: mockService }],
    }).compile();
    controller = module.get<TeacherController>(TeacherController);
    service = module.get<TeacherService>(TeacherService);
    jest.clearAllMocks();
  });

  describe('requestJoinAcademy', () => {
    it('should request to join academy successfully', async () => {
      const joinAcademyRequestDto: JoinAcademyRequestDto = {
        code: 'TEST001',
        message: 'I want to join this academy',
      };
      const result = { message: '가입 요청이 전송되었습니다.' };
      mockService.requestJoinAcademy.mockResolvedValue(result);

      const response = await controller.requestJoinAcademy(
        mockUser,
        joinAcademyRequestDto,
      );

      expect(response).toEqual(result);
      expect(service.requestJoinAcademy).toHaveBeenCalledWith(
        mockUser.id,
        joinAcademyRequestDto,
      );
    });
  });

  describe('getMyProfile', () => {
    it('should get teacher profile successfully', async () => {
      const teacherProfile = {
        id: 1,
        userId: 1,
        name: 'Test Teacher',
        phoneNumber: '010-1234-5678',
        introduction: 'Test introduction',
        photoUrl: 'test.jpg',
        education: ['Test University'],
        specialties: ['Ballet'],
        certifications: ['Test Certification'],
        yearsOfExperience: 5,
        availableTimes: {},
        academyId: 1,
        academy: { id: 1, name: 'Test Academy' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockService.getTeacherProfile.mockResolvedValue(teacherProfile);

      const result = await controller.getMyProfile(mockUser);

      expect(result).toEqual(teacherProfile);
      expect(service.getTeacherProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('updateMyProfile', () => {
    it('should update teacher profile successfully', async () => {
      const updateData = {
        name: 'Updated Teacher',
        introduction: 'Updated introduction',
      };
      const updatedProfile = {
        id: 1,
        ...updateData,
        phoneNumber: '010-1234-5678',
        photoUrl: 'test.jpg',
        education: ['Test University'],
        specialties: ['Ballet'],
        certifications: ['Test Certification'],
        yearsOfExperience: 5,
        availableTimes: {},
        academyId: 1,
        academy: { id: 1, name: 'Test Academy' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateMyProfile(mockUser, updateData);

      expect(result).toEqual(updatedProfile);
      expect(service.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        updateData,
      );
    });
  });

  describe('updateMyProfilePhoto', () => {
    it('should update teacher profile photo successfully', async () => {
      const mockPhoto = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;
      const result = { message: '프로필 사진이 업데이트되었습니다.' };
      mockService.updateProfilePhoto.mockResolvedValue(result);

      const response = await controller.updateMyProfilePhoto(
        mockUser,
        mockPhoto,
      );

      expect(response).toEqual(result);
      expect(service.updateProfilePhoto).toHaveBeenCalledWith(
        mockUser.id,
        mockPhoto,
      );
    });
  });

  describe('getTeacherData', () => {
    it('should get teacher data successfully', async () => {
      const teacherData = {
        profile: {
          id: 1,
          name: 'Test Teacher',
        },
        classes: [],
        sessions: [],
      };
      mockService.getTeacherData.mockResolvedValue(teacherData);

      const result = await controller.getTeacherData(mockUser);

      expect(result).toEqual(teacherData);
      expect(service.getTeacherData).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getMyClasses', () => {
    it('should get teacher classes successfully', async () => {
      const classes = [
        {
          id: 1,
          name: 'Test Class 1',
          description: 'Test Description 1',
        },
        {
          id: 2,
          name: 'Test Class 2',
          description: 'Test Description 2',
        },
      ];
      mockService.getTeacherClasses.mockResolvedValue(classes);

      const result = await controller.getMyClasses(mockUser);

      expect(result).toEqual(classes);
      expect(service.getTeacherClasses).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getMyClassesWithSessions', () => {
    it('should get teacher classes with sessions successfully', async () => {
      const classesWithSessions = [
        {
          id: 1,
          name: 'Test Class 1',
          sessions: [
            { id: 1, date: new Date() },
            { id: 2, date: new Date() },
          ],
        },
      ];
      mockService.getTeacherClassesWithSessions.mockResolvedValue(
        classesWithSessions,
      );

      const result = await controller.getMyClassesWithSessions(mockUser);

      expect(result).toEqual(classesWithSessions);
      expect(service.getTeacherClassesWithSessions).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('getMyAcademy', () => {
    it('should get teacher academy successfully', async () => {
      const academy = {
        id: 1,
        name: 'Test Academy',
        code: 'TEST001',
      };
      mockService.getMyAcademy.mockResolvedValue(academy);

      const result = await controller.getMyAcademy(mockUser);

      expect(result).toEqual(academy);
      expect(service.getMyAcademy).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('changeAcademy', () => {
    it('should change teacher academy successfully', async () => {
      const body = { code: 'NEW001' };
      const result = { message: '학원이 변경되었습니다.' };
      mockService.changeAcademy.mockResolvedValue(result);

      const response = await controller.changeAcademy(mockUser, body);

      expect(response).toEqual(result);
      expect(service.changeAcademy).toHaveBeenCalledWith(
        mockUser.id,
        body.code,
      );
    });
  });

  describe('leaveAcademy', () => {
    it('should leave academy successfully', async () => {
      const result = { message: '학원을 나갔습니다.' };
      mockService.leaveAcademy.mockResolvedValue(result);

      const response = await controller.leaveAcademy(mockUser);

      expect(response).toEqual(result);
      expect(service.leaveAcademy).toHaveBeenCalledWith(mockUser.id);
    });
  });
});

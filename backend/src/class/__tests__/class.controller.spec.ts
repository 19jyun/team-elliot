import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from '../class.controller';
import { ClassService } from '../class.service';
import { CreateClassDto, DayOfWeek } from '../../types/class.types';
import {
  UpdateClassStatusDto,
  ClassStatus,
} from '../dto/update-class-status.dto';

describe('ClassController', () => {
  let controller: ClassController;
  let service: ClassService;

  const mockService = {
    getClassDetails: jest.fn(),
    getAllClasses: jest.fn(),
    createClass: jest.fn(),
    updateClass: jest.fn(),
    updateClassDetails: jest.fn(),
    deleteClass: jest.fn(),
    updateClassStatus: jest.fn(),
    getDraftClasses: jest.fn(),
    getActiveClasses: jest.fn(),
    getAllAcademyClasses: jest.fn(),
    enrollStudent: jest.fn(),
    unenrollStudent: jest.fn(),
    getClassesByMonth: jest.fn(),
    getClassesWithSessionsByMonth: jest.fn(),
    generateSessionsForExistingClass: jest.fn(),
    generateSessionsForPeriod: jest.fn(),
  };

  const mockUser = {
    id: 1,
    userId: 'testuser',
    role: 'PRINCIPAL',
    academyId: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [{ provide: ClassService, useValue: mockService }],
    }).compile();
    controller = module.get<ClassController>(ClassController);
    service = module.get<ClassService>(ClassService);
    jest.clearAllMocks();
  });

  describe('getClassDetails', () => {
    it('should get class details', async () => {
      const details = { id: 1, className: 'Test Class' };
      mockService.getClassDetails.mockResolvedValue(details);
      await expect(controller.getClassDetails(1)).resolves.toBe(details);
      expect(service.getClassDetails).toHaveBeenCalledWith(1);
    });
  });

  describe('getAcademyClasses', () => {
    it('should return draft classes when status is DRAFT', async () => {
      const classes = [{ id: 1 }];
      mockService.getDraftClasses.mockResolvedValue(classes);
      await expect(
        controller.getAcademyClasses(mockUser, 'DRAFT'),
      ).resolves.toBe(classes);
      expect(service.getDraftClasses).toHaveBeenCalledWith(mockUser.academyId);
    });

    it('should return active classes when status is ACTIVE', async () => {
      const classes = [{ id: 2 }];
      mockService.getActiveClasses.mockResolvedValue(classes);
      await expect(
        controller.getAcademyClasses(mockUser, 'ACTIVE'),
      ).resolves.toBe(classes);
      expect(service.getActiveClasses).toHaveBeenCalledWith(mockUser.academyId);
    });

    it('should return all academy classes when status is omitted', async () => {
      const classes = [{ id: 3 }];
      mockService.getAllAcademyClasses.mockResolvedValue(classes);
      await expect(controller.getAcademyClasses(mockUser)).resolves.toBe(
        classes,
      );
      expect(service.getAllAcademyClasses).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getClasses', () => {
    it('should get all classes without filters', async () => {
      const classes = [{ id: 1, className: 'Test Class' }];
      mockService.getAllClasses.mockResolvedValue(classes);
      await expect(
        controller.getClasses(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ),
      ).resolves.toBe(classes);
      expect(service.getAllClasses).toHaveBeenCalledWith({});
    });

    it('should get classes with dayOfWeek filter', async () => {
      const classes = [{ id: 1, className: 'Test Class' }];
      mockService.getAllClasses.mockResolvedValue(classes);
      await expect(
        controller.getClasses(
          undefined,
          undefined,
          undefined,
          'MONDAY',
          undefined,
          undefined,
        ),
      ).resolves.toBe(classes);
      expect(service.getAllClasses).toHaveBeenCalledWith({
        dayOfWeek: 'MONDAY',
        teacherId: undefined,
      });
    });

    it('should get classes with teacherId filter', async () => {
      const classes = [{ id: 1, className: 'Test Class' }];
      mockService.getAllClasses.mockResolvedValue(classes);
      await expect(
        controller.getClasses(
          undefined,
          undefined,
          undefined,
          undefined,
          '1',
          undefined,
        ),
      ).resolves.toBe(classes);
      expect(service.getAllClasses).toHaveBeenCalledWith({
        dayOfWeek: undefined,
        teacherId: 1,
      });
    });

    it('should get classes by month when filters provided', async () => {
      const classes = [{ id: 1, className: 'January Class' }];
      mockService.getClassesByMonth.mockResolvedValue(classes);
      await expect(controller.getClasses('2024', '01')).resolves.toBe(classes);
      expect(service.getClassesByMonth).toHaveBeenCalledWith('01', 2024);
    });

    it('should include sessions when includeSessions is true', async () => {
      const classes = [{ id: 1 }];
      mockService.getClassesWithSessionsByMonth.mockResolvedValue(classes);
      const studentUser = { id: 9, role: 'STUDENT' };
      await expect(
        controller.getClasses(
          '2024',
          '02',
          'true',
          undefined,
          undefined,
          studentUser,
        ),
      ).resolves.toBe(classes);
      expect(service.getClassesWithSessionsByMonth).toHaveBeenCalledWith(
        '02',
        2024,
        studentUser.id,
      );
    });
  });

  describe('createClass', () => {
    it('should create a class', async () => {
      const dto: CreateClassDto = {
        className: 'Test Class',
        description: 'Test Description',
        maxStudents: 10,
        tuitionFee: 100000,
        teacherId: 1,
        academyId: 1,
        dayOfWeek: 'MONDAY' as DayOfWeek,
        startTime: '14:00',
        endTime: '15:00',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
        level: 'BEGINNER',
      };
      const created = { id: 1, ...dto };

      mockService.createClass.mockResolvedValue(created);

      await expect(controller.createClass(dto, mockUser)).resolves.toBe(
        created,
      );
      expect(service.createClass).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('updateClass', () => {
    it('should update a class', async () => {
      const classId = 1;
      const updateData = { className: 'Updated Class' };
      const updated = { id: classId, ...updateData };
      mockService.updateClass.mockResolvedValue(updated);
      await expect(controller.updateClass(classId, updateData)).resolves.toBe(
        updated,
      );
      expect(service.updateClass).toHaveBeenCalledWith(classId, updateData);
    });
  });

  describe('updateClassDetails', () => {
    it('should update class details', async () => {
      const classId = 1;
      const updateData = {
        description: 'Updated description',
        locationName: 'New Location',
        mapImageUrl: '/uploads/map.jpg',
        requiredItems: ['Item 1', 'Item 2'],
        curriculum: ['Lesson 1', 'Lesson 2'],
      };
      const updated = { id: classId, ...updateData };
      mockService.updateClassDetails.mockResolvedValue(updated);
      await expect(
        controller.updateClassDetails(classId, updateData, mockUser),
      ).resolves.toBe(updated);
      expect(service.updateClassDetails).toHaveBeenCalledWith(
        classId,
        updateData,
        mockUser.id,
      );
    });
  });

  describe('deleteClass', () => {
    it('should delete a class', async () => {
      const classId = 1;
      const result = { message: 'Class deleted successfully' };
      mockService.deleteClass.mockResolvedValue(result);
      await expect(controller.deleteClass(classId)).resolves.toBe(result);
      expect(service.deleteClass).toHaveBeenCalledWith(classId);
    });
  });

  describe('updateClassStatus', () => {
    it('should update class status', async () => {
      const classId = 1;
      const updateStatusDto: UpdateClassStatusDto = {
        status: ClassStatus.OPEN,
        reason: 'Approved for good content',
      };
      const result = { message: 'Status updated successfully' };
      mockService.updateClassStatus.mockResolvedValue(result);
      await expect(
        controller.updateClassStatus(classId, updateStatusDto, mockUser),
      ).resolves.toBe(result);
      expect(service.updateClassStatus).toHaveBeenCalledWith(
        classId,
        mockUser.id,
        updateStatusDto.status,
        updateStatusDto.reason,
      );
    });
  });

  describe('createEnrollment', () => {
    it('should enroll student in class', async () => {
      const classId = 1;
      const studentId = 1;
      const result = { message: 'Student enrolled successfully' };
      mockService.enrollStudent.mockResolvedValue(result);
      await expect(
        controller.createEnrollment(classId, studentId),
      ).resolves.toBe(result);
      expect(service.enrollStudent).toHaveBeenCalledWith(classId, studentId);
    });
  });

  describe('unenrollClass', () => {
    it('should unenroll student from class', async () => {
      const classId = 1;
      const studentId = 1;
      const result = { message: 'Student unenrolled successfully' };
      mockService.unenrollStudent.mockResolvedValue(result);
      await expect(controller.unenrollClass(classId, studentId)).resolves.toBe(
        result,
      );
      expect(service.unenrollStudent).toHaveBeenCalledWith(classId, studentId);
    });
  });

  describe('createSessionGenerationJob', () => {
    it('should generate sessions for class', async () => {
      const classId = 1;
      const result = { message: 'Sessions generated successfully' };
      mockService.generateSessionsForExistingClass.mockResolvedValue(result);
      await expect(
        controller.createSessionGenerationJob(classId),
      ).resolves.toBe(result);
      expect(service.generateSessionsForExistingClass).toHaveBeenCalledWith(
        classId,
      );
    });
  });

  describe('generateSessionsForPeriod', () => {
    it('should generate sessions for period', async () => {
      const classId = 1;
      const data = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
      };
      const result = { message: 'Sessions generated for period successfully' };
      mockService.generateSessionsForPeriod.mockResolvedValue(result);
      await expect(
        controller.generateSessionsForPeriod(classId, data),
      ).resolves.toBe(result);
      expect(service.generateSessionsForPeriod).toHaveBeenCalledWith(
        classId,
        new Date(data.startDate),
        new Date(data.endDate),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ClassService } from '../class.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../../socket/socket.gateway';
import { ClassSocketManager } from '../../socket/managers/class-socket.manager';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { CreateClassDto, DayOfWeek } from '../../types/class.types';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ClassService', () => {
  let service: ClassService;
  let prisma: any;

  const mockPrisma = {
    class: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
    enrollment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    classSession: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    sessionEnrollment: {
      deleteMany: jest.fn(),
    },
    refundRequest: {
      deleteMany: jest.fn(),
    },
    payment: {
      deleteMany: jest.fn(),
    },
    attendance: {
      deleteMany: jest.fn(),
    },
    sessionContent: {
      deleteMany: jest.fn(),
    },
    academy: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockSocketGateway = {
    notifyTeacherAssignedToClass: jest.fn(),
  };

  const mockClassSocketManager = {
    notifyClassCreated: jest.fn(),
  };

  const mockPushNotificationService = {
    sendToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SocketGateway, useValue: mockSocketGateway },
        { provide: ClassSocketManager, useValue: mockClassSocketManager },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
    }).compile();
    service = module.get<ClassService>(ClassService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getAllClasses', () => {
    it('should get all classes', async () => {
      const classes = [{ id: 1, className: 'A' }];
      prisma.class.findMany.mockResolvedValue(classes);
      const result = await service.getAllClasses({});
      expect(result).toBe(classes);
      expect(prisma.class.findMany).toHaveBeenCalled();
    });

    it('should get classes with dayOfWeek filter', async () => {
      const classes = [{ id: 1, className: 'Monday Class' }];
      prisma.class.findMany.mockResolvedValue(classes);
      const result = await service.getAllClasses({ dayOfWeek: 'MONDAY' });
      expect(result).toBe(classes);
      expect(prisma.class.findMany).toHaveBeenCalledWith({
        where: { dayOfWeek: 'MONDAY' },
        include: expect.any(Object),
      });
    });

    it('should get classes with teacherId filter', async () => {
      const classes = [{ id: 1, className: 'Teacher Class' }];
      prisma.class.findMany.mockResolvedValue(classes);
      const result = await service.getAllClasses({ teacherId: 1 });
      expect(result).toBe(classes);
      expect(prisma.class.findMany).toHaveBeenCalledWith({
        where: { teacherId: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('createClass', () => {
    it('should create a class (success)', async () => {
      const createClassDto: CreateClassDto = {
        className: 'A',
        description: 'Test class',
        maxStudents: 10,
        tuitionFee: 10000,
        teacherId: 1,
        academyId: 1,
        dayOfWeek: 'MONDAY' as DayOfWeek,
        startTime: '14:00',
        endTime: '15:00',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
        level: 'BEGINNER',
      };

      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      prisma.academy.findUnique.mockResolvedValue({ id: 1 });
      prisma.class.findMany.mockResolvedValue([]); // 기존 클래스 없음
      prisma.class.create.mockResolvedValue({ id: 1, className: 'A' });
      prisma.class.findUnique.mockResolvedValue({ id: 1, className: 'A' }); // generateClassSessions에서 사용
      prisma.classSession.createMany.mockResolvedValue({ count: 4 });

      const result = await service.createClass(createClassDto);

      expect(result).toEqual({
        id: 1,
        className: 'A',
        message: '5개의 세션이 자동으로 생성되었습니다.',
        sessionCount: 5,
      });
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: createClassDto.teacherId },
        include: {
          academy: {
            include: {
              principal: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const createClassDto: CreateClassDto = {
        className: 'A',
        description: 'Test class',
        maxStudents: 10,
        tuitionFee: 10000,
        teacherId: 999,
        academyId: 1,
        dayOfWeek: 'MONDAY' as DayOfWeek,
        startTime: '14:00',
        endTime: '15:00',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
        level: 'BEGINNER',
      };

      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.createClass(createClassDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when teacher not found with academy', async () => {
      const createClassDto: CreateClassDto = {
        className: 'A',
        description: 'Test class',
        maxStudents: 10,
        tuitionFee: 10000,
        teacherId: 999,
        academyId: 1,
        dayOfWeek: 'MONDAY' as DayOfWeek,
        startTime: '14:00',
        endTime: '15:00',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T00:00:00.000Z',
        level: 'BEGINNER',
      };

      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.createClass(createClassDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getClassDetails', () => {
    it('should get class details', async () => {
      const classId = 1;
      const classDetails = {
        id: classId,
        className: 'Test Class',
        description: 'Test Description',
        teacher: { id: 1, name: 'Test Teacher' },
        enrollments: [],
      };

      prisma.class.findUnique.mockResolvedValue(classDetails);

      const result = await service.getClassDetails(classId);

      expect(result).toEqual(classDetails);
      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: classId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when class not found', async () => {
      const classId = 999;

      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.getClassDetails(classId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateClass', () => {
    it('should update a class', async () => {
      const classId = 1;
      const updateData = { className: 'Updated Class' };
      const updatedClass = { id: classId, ...updateData };

      prisma.class.findUnique.mockResolvedValue({ id: classId });
      prisma.class.update.mockResolvedValue(updatedClass);

      const result = await service.updateClass(classId, updateData);

      expect(result).toEqual(updatedClass);
      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: classId },
      });
      expect(prisma.class.update).toHaveBeenCalledWith({
        where: { id: classId },
        data: updateData,
      });
    });

    it('should throw NotFoundException when class not found', async () => {
      const classId = 999;
      const updateData = { className: 'Updated Class' };

      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.updateClass(classId, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteClass', () => {
    it('should delete a class with all related data in correct order', async () => {
      const classId = 1;
      const deletedClass = { id: classId, className: 'Deleted Class' };

      prisma.class.findUnique.mockResolvedValue({
        id: classId,
        enrollments: [],
        classSessions: [{ id: 1 }, { id: 2 }],
      });

      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          ...mockPrisma,
          refundRequest: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          payment: {
            deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
          },
          attendance: {
            deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
          sessionEnrollment: {
            deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
          },
          sessionContent: {
            deleteMany: jest.fn().mockResolvedValue({ count: 4 }),
          },
          classSession: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          class: {
            delete: jest.fn().mockResolvedValue(deletedClass),
          },
        };
        return await callback(mockTx);
      });

      const result = await service.deleteClass(classId);

      expect(result).toEqual({
        message:
          '클래스 "Deleted Class"과 관련된 모든 데이터가 성공적으로 삭제되었습니다.',
        deletedData: {
          class: 1,
          sessions: 2,
          sessionEnrollments: 5,
          payments: 5,
          refundRequests: 2,
          attendances: 3,
          sessionContents: 4,
        },
      });
      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: classId },
        include: expect.any(Object),
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when class not found', async () => {
      const classId = 999;

      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.deleteClass(classId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('enrollStudent', () => {
    it('should enroll student successfully', async () => {
      const classId = 1;
      const studentId = 1;

      prisma.class.findUnique.mockResolvedValue({
        id: classId,
        maxStudents: 10,
        enrollments: [],
      });
      prisma.enrollment.findFirst.mockResolvedValue(null);
      prisma.enrollment.create.mockResolvedValue({ classId, studentId });

      const result = await service.enrollStudent(classId, studentId);

      expect(result).toEqual({ classId, studentId });
      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: classId },
        include: expect.any(Object),
      });
      expect(prisma.enrollment.findFirst).toHaveBeenCalledWith({
        where: { classId, studentId },
      });
      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: { classId, studentId },
      });
    });

    it('should throw NotFoundException when class not found', async () => {
      const classId = 999;
      const studentId = 1;

      prisma.class.findUnique.mockResolvedValue(null);

      await expect(service.enrollStudent(classId, studentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when student already enrolled', async () => {
      const classId = 1;
      const studentId = 1;

      prisma.class.findUnique.mockResolvedValue({
        id: classId,
        maxStudents: 10,
        enrollments: [],
      });
      prisma.enrollment.findFirst.mockResolvedValue({ classId, studentId });

      await expect(service.enrollStudent(classId, studentId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('unenrollStudent', () => {
    it('should unenroll student successfully', async () => {
      const classId = 1;
      const studentId = 1;

      prisma.enrollment.findFirst.mockResolvedValue({
        id: 1,
        classId,
        studentId,
      });
      prisma.enrollment.delete.mockResolvedValue({ id: 1, classId, studentId });

      const result = await service.unenrollStudent(classId, studentId);

      expect(result).toEqual({ id: 1, classId, studentId });
      expect(prisma.enrollment.findFirst).toHaveBeenCalledWith({
        where: { classId, studentId },
      });
      expect(prisma.enrollment.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when enrollment not found', async () => {
      const classId = 1;
      const studentId = 1;

      prisma.enrollment.findFirst.mockResolvedValue(null);

      await expect(service.unenrollStudent(classId, studentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getClassesByMonth', () => {
    it('should get classes by month', async () => {
      const month = '01';
      const year = 2024;
      const classes = [{ id: 1, className: 'January Class' }];

      prisma.class.findMany.mockResolvedValue(classes);

      const result = await service.getClassesByMonth(month, year);

      expect(result).toEqual(classes);
      expect(prisma.class.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: expect.any(Object),
      });
    });
  });
});

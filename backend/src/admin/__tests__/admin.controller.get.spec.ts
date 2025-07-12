import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('AdminController - GET endpoints', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getStudents: jest.fn(),
            getTeachers: jest.fn(),
            getClasses: jest.fn(),
            getWithdrawalStats: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should return students', async () => {
    const students = [
      {
        id: 1,
        userId: 's1',
        password: 'pw',
        name: 'n',
        phoneNumber: '01011110101',
        emergencyContact: '',
        birthDate: new Date(),
        notes: '',
        level: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    jest.spyOn(service, 'getStudents').mockResolvedValue(students);
    await expect(controller.getStudents()).resolves.toBe(students);
  });

  it('should return teachers', async () => {
    const teachers = [
      {
        id: 1,
        userId: 't1',
        password: 'pw',
        name: 'n',
        phoneNumber: '01011110101',
        createdAt: new Date(),
        updatedAt: new Date(),
        introduction: '',
        photoUrl: '',
        education: [],
        specialties: [],
        certifications: [],
        yearsOfExperience: 1,
        availableTimes: {},
      },
    ];
    jest.spyOn(service, 'getTeachers').mockResolvedValue(teachers);
    await expect(controller.getTeachers()).resolves.toBe(teachers);
  });

  it('should return classes', async () => {
    const classes = [
      {
        id: 1,
        className: 'Test Class',
        classCode: 'TEST-001',
        description: 'Test Description',
        maxStudents: 20,
        currentStudents: 0,
        tuitionFee: 100000,
        teacherId: 1,
        academyId: 1,
        dayOfWeek: 'MONDAY',
        startTime: new Date('1970-01-01T10:00:00Z'),
        endTime: new Date('1970-01-01T11:00:00Z'),
        level: 'BEGINNER',
        status: 'OPEN',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        backgroundColor: 'blue',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    jest.spyOn(service, 'getClasses').mockResolvedValue(classes);
    await expect(controller.getClasses()).resolves.toBe(classes);
  });

  it('should return withdrawal stats', async () => {
    const stats = {
      total: 5,
      byReason: {
        DISSATISFACTION: 2,
        UNUSED: 1,
        PRIVACY: 1,
        OTHER: 1,
      },
      byRole: {
        STUDENT: 4,
        TEACHER: 1,
      },
    };
    jest.spyOn(service, 'getWithdrawalStats').mockResolvedValue(stats);
    await expect(controller.getWithdrawalStats()).resolves.toBe(stats);
  });
});

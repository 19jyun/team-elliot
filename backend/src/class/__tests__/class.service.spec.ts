import { Test, TestingModule } from '@nestjs/testing';
import { ClassService } from '../class.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ClassService>(ClassService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should get all classes', async () => {
    const classes = [{ id: 1, className: 'A' }];
    prisma.class.findMany.mockResolvedValue(classes);
    const result = await service.getAllClasses({});
    expect(result).toBe(classes);
    expect(prisma.class.findMany).toHaveBeenCalled();
  });

  it('should create a class (success)', async () => {
    prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
    prisma.class.create.mockResolvedValue({ id: 1, className: 'A' });
    const result = await service.createClass({
      className: 'A',
      tuitionFee: 10000,
      teacherId: 1,
      dayOfWeek: '월',
      startTime: '14:00',
      endTime: '15:00',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    });
    expect(result).toEqual({ id: 1, className: 'A' });
  });

  it('should throw if teacher not found on createClass', async () => {
    prisma.teacher.findUnique.mockResolvedValue(null);
    await expect(
      service.createClass({
        className: 'A',
        tuitionFee: 10000,
        teacherId: 1,
        dayOfWeek: '월',
        startTime: '14:00',
        endTime: '15:00',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a class (success)', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1 });
    prisma.class.update.mockResolvedValue({ id: 1, className: 'B' });
    const result = await service.updateClass(1, { className: 'B' });
    expect(result).toEqual({ id: 1, className: 'B' });
  });

  it('should throw if class not found on updateClass', async () => {
    prisma.class.findUnique.mockResolvedValue(null);
    await expect(service.updateClass(1, { className: 'B' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a class (success)', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1, enrollments: [] });
    prisma.class.delete.mockResolvedValue({ id: 1 });
    const result = await service.deleteClass(1);
    expect(result).toEqual({ id: 1 });
  });

  it('should throw if class not found on deleteClass', async () => {
    prisma.class.findUnique.mockResolvedValue(null);
    await expect(service.deleteClass(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw if class has enrollments on deleteClass', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1, enrollments: [{}] });
    await expect(service.deleteClass(1)).rejects.toThrow(BadRequestException);
  });

  it('should enroll a student (success)', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1, enrollments: [] });
    prisma.enrollment.findFirst.mockResolvedValue(null);
    prisma.enrollment.create.mockResolvedValue({ id: 1 });
    const result = await service.enrollStudent(1, 2);
    expect(result).toEqual({ id: 1 });
  });

  it('should throw if class not found on enrollStudent', async () => {
    prisma.class.findUnique.mockResolvedValue(null);
    await expect(service.enrollStudent(1, 2)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw if class is full on enrollStudent', async () => {
    prisma.class.findUnique.mockResolvedValue({
      id: 1,
      maxStudents: 1,
      enrollments: [{}],
    });
    await expect(service.enrollStudent(1, 2)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if already enrolled', async () => {
    prisma.class.findUnique.mockResolvedValue({ id: 1, enrollments: [] });
    prisma.enrollment.findFirst.mockResolvedValue({ id: 1 });
    await expect(service.enrollStudent(1, 2)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should unenroll a student (success)', async () => {
    prisma.enrollment.findFirst.mockResolvedValue({ id: 1 });
    prisma.enrollment.delete.mockResolvedValue({ id: 1 });
    const result = await service.unenrollStudent(1, 2);
    expect(result).toEqual({ id: 1 });
  });

  it('should throw if enrollment not found on unenrollStudent', async () => {
    prisma.enrollment.findFirst.mockResolvedValue(null);
    await expect(service.unenrollStudent(1, 2)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get class details (success)', async () => {
    prisma.class.findUnique.mockResolvedValue({
      id: 1,
      teacher: {},
      classDetail: {},
    });
    const result = await service.getClassDetails(1);
    expect(result).toEqual({ id: 1, teacher: {}, classDetail: {} });
  });

  it('should throw if class not found on getClassDetails', async () => {
    prisma.class.findUnique.mockResolvedValue(null);
    await expect(service.getClassDetails(1)).rejects.toThrow(NotFoundException);
  });

  it('should get classes by month', async () => {
    const classes = [{ id: 1 }];
    prisma.class.findMany.mockResolvedValue(classes);
    const result = await service.getClassesByMonth('07', 2024);
    expect(result).toBe(classes);
  });
});

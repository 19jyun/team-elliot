import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { CreateClassDto } from '../dto/create-class.dto';

jest.mock('bcrypt');

describe('AdminService', () => {
  let service: AdminService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      student: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      teacher: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      class: {
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      withdrawalHistory: {
        findMany: jest.fn(),
      },
      enrollment: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  describe('createStudent', () => {
    it('should create a new student', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashedpw');
      prisma.student.create.mockResolvedValue({ id: 1 });
      const dto = {
        userId: 's1',
        password: 'pw',
        name: 'n',
        phoneNumber: '010',
      };
      await expect(service.createStudent(dto)).resolves.toEqual({ id: 1 });
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: { ...dto, password: 'hashedpw' },
      });
    });
    it('should throw if userId exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      const dto = {
        userId: 's1',
        password: 'pw',
        name: 'n',
        phoneNumber: '010',
      };
      await expect(service.createStudent(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createTeacher', () => {
    it('should create a new teacher', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashedpw');
      prisma.teacher.create.mockResolvedValue({ id: 1 });
      const dto = {
        userId: 't1',
        password: 'pw',
        name: 'n',
        introduction: '',
        photoUrl: '',
        education: [],
      };
      await expect(service.createTeacher(dto)).resolves.toEqual({ id: 1 });
      expect(prisma.teacher.create).toHaveBeenCalledWith({
        data: { ...dto, password: 'hashedpw' },
      });
    });
    it('should throw if userId exists', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      const dto = {
        userId: 't1',
        password: 'pw',
        name: 'n',
        introduction: '',
        photoUrl: '',
        education: [],
      };
      await expect(service.createTeacher(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createClass', () => {
    it('should create a class if teacher exists', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 1 });
      prisma.class.create.mockResolvedValue({ id: 1 });
      const dto: CreateClassDto = {
        className: 'Test Class',
        description: 'Test Description',
        maxStudents: 10,
        tuitionFee: 100000,
        teacherId: 1,
        dayOfWeek: 'MONDAY',
        startTime: '14:00',
        endTime: '15:00',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        level: 'BEGINNER',
        backgroundColor: '#F8F9FA',
      };
      await expect(service.createClass(dto)).resolves.toEqual({ id: 1 });
      expect(prisma.class.create).toHaveBeenCalled();
    });
    it('should throw if teacher does not exist', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);
      const dto: CreateClassDto = {
        className: 'Test Class',
        description: 'Test Description',
        maxStudents: 10,
        tuitionFee: 100000,
        teacherId: 1,
        dayOfWeek: 'MONDAY',
        startTime: '14:00',
        endTime: '15:00',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        level: 'BEGINNER',
        backgroundColor: '#F8F9FA',
      };
      await expect(service.createClass(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  it('should get students', async () => {
    prisma.student.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.getStudents()).resolves.toEqual([{ id: 1 }]);
  });

  it('should get teachers', async () => {
    prisma.teacher.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.getTeachers()).resolves.toEqual([{ id: 1 }]);
  });

  it('should get classes', async () => {
    prisma.class.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.getClasses()).resolves.toEqual([{ id: 1 }]);
  });

  it('should get withdrawal stats', async () => {
    prisma.withdrawalHistory.findMany.mockResolvedValue([
      { reasonCategory: 'DISSATISFACTION', userRole: 'STUDENT' },
      { reasonCategory: 'UNUSED', userRole: 'STUDENT' },
      { reasonCategory: 'PRIVACY', userRole: 'TEACHER' },
    ]);
    await expect(service.getWithdrawalStats()).resolves.toEqual({
      total: 3,
      byReason: {
        DISSATISFACTION: 1,
        UNUSED: 1,
        PRIVACY: 1,
        OTHER: 0,
      },
      byRole: {
        STUDENT: 2,
        TEACHER: 1,
      },
    });
  });

  describe('deleteStudent', () => {
    it('should delete student and enrollments if student exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1, enrollments: [] });
      prisma.$transaction.mockResolvedValue(undefined);
      await expect(service.deleteStudent(1)).resolves.toEqual({
        message: '학생이 성공적으로 삭제되었습니다.',
      });
      expect(prisma.$transaction).toHaveBeenCalled();
    });
    it('should throw if student does not exist', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      await expect(service.deleteStudent(1)).rejects.toThrow(NotFoundException);
    });
  });

  it('should delete teacher', async () => {
    prisma.teacher.delete.mockResolvedValue({ id: 1 });
    await expect(service.deleteTeacher(1)).resolves.toEqual({ id: 1 });
  });

  it('should delete class', async () => {
    prisma.class.delete.mockResolvedValue({ id: 1 });
    await expect(service.deleteClass(1)).resolves.toEqual({ id: 1 });
  });

  describe('resetStudentPassword', () => {
    it('should reset password if student exists', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 1 });
      (hash as jest.Mock).mockResolvedValue('hashedpw');
      prisma.student.update.mockResolvedValue(undefined);
      await expect(service.resetStudentPassword(1, 'newpw')).resolves.toEqual({
        message: '비밀번호가 성공적으로 초기화되었습니다.',
      });
      expect(prisma.student.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashedpw' },
      });
    });
    it('should throw if student does not exist', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      await expect(service.resetStudentPassword(1, 'newpw')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

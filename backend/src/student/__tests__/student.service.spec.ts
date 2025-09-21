import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudentService } from '../student.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClassService } from '../../class/class.service';
import { AcademyService } from '../../academy/academy.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('StudentService', () => {
  let service: StudentService;
  let prismaService: PrismaService;
  let classService: ClassService;

  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
    },
    class: {
      findUnique: jest.fn(),
    },
  };

  const mockClassService = {
    enrollStudent: jest.fn(),
    unenrollStudent: jest.fn(),
  };

  const mockAcademyService = {
    joinAcademy: jest.fn(),
    leaveAcademy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
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

    service = module.get<StudentService>(StudentService);
    prismaService = module.get<PrismaService>(PrismaService);
    classService = module.get<ClassService>(ClassService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudentClasses', () => {
    it('should return student classes successfully', async () => {
      const userRefId = 1;
      const mockStudent = {
        id: 1,
        userRefId,
        enrollments: [
          {
            class: {
              id: 1,
              name: '수학',
              description: '기초 수학',
              maxStudents: 20,
              currentStudents: 15,
              price: new Decimal(100000),
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              teacher: {
                id: 1,
                name: '김선생님',
              },
            },
          },
          {
            class: {
              id: 2,
              name: '영어',
              description: '기초 영어',
              maxStudents: 15,
              currentStudents: 10,
              price: new Decimal(120000),
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              teacher: {
                id: 2,
                name: '이선생님',
              },
            },
          },
        ],
        sessionEnrollments: [
          {
            status: 'CONFIRMED',
            session: {
              class: {
                id: 1,
                name: '수학',
                description: '기초 수학',
                maxStudents: 20,
                currentStudents: 15,
                price: new Decimal(100000),
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                teacher: {
                  id: 1,
                  name: '김선생님',
                },
              },
            },
          },
        ],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.getStudentClasses(userRefId);

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
        include: {
          enrollments: {
            include: {
              class: {
                include: {
                  teacher: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          sessionEnrollments: {
            include: {
              session: {
                include: {
                  class: {
                    include: {
                      teacher: {
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
          },
        },
      });

      expect(result).toEqual({
        enrollmentClasses: [
          {
            id: 1,
            name: '수학',
            description: '기초 수학',
            maxStudents: 20,
            currentStudents: 15,
            price: new Decimal(100000),
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            teacher: {
              id: 1,
              name: '김선생님',
            },
          },
        ],
        sessionClasses: [],
        calendarRange: expect.any(Object),
      });
    });

    it('should throw NotFoundException when student not found', async () => {
      const userRefId = 999;

      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.getStudentClasses(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('enrollClass', () => {
    it('should call classService.enrollStudent successfully', async () => {
      const userRefId = 1;
      const classId = 1;
      const studentId = 1;
      const mockResult = { message: 'Enrollment successful' };
      const mockStudent = { id: studentId, userRefId };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockClassService.enrollStudent.mockResolvedValue(mockResult);

      const result = await service.enrollClass(classId, userRefId);

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(classService.enrollStudent).toHaveBeenCalledWith(
        classId,
        studentId,
      );
    });

    it('should throw NotFoundException when student not found', async () => {
      const userRefId = 999;
      const classId = 1;

      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.enrollClass(classId, userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unenrollClass', () => {
    it('should call classService.unenrollStudent successfully', async () => {
      const userRefId = 1;
      const classId = 1;
      const studentId = 1;
      const mockResult = { message: 'Unenrollment successful' };
      const mockStudent = { id: studentId, userRefId };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockClassService.unenrollStudent.mockResolvedValue(mockResult);

      const result = await service.unenrollClass(classId, userRefId);

      expect(result).toEqual(mockResult);
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(classService.unenrollStudent).toHaveBeenCalledWith(
        classId,
        studentId,
      );
    });

    it('should throw NotFoundException when student not found', async () => {
      const userRefId = 999;
      const classId = 1;

      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.unenrollClass(classId, userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

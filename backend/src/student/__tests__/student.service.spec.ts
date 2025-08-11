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
  let academyService: AcademyService;

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
    academyService = module.get<AcademyService>(AcademyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudentClasses', () => {
    it('should return student classes successfully', async () => {
      const studentId = 1;
      const mockStudent = {
        id: studentId,
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
          {
            status: 'CONFIRMED',
            session: {
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
          },
        ],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.getStudentClasses(studentId);

      expect(prismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: studentId },
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
          {
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
        ],
        sessionClasses: [],
        calendarRange: expect.any(Object),
      });
    });

    it('should throw NotFoundException when student not found', async () => {
      const studentId = 999;
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      await expect(service.getStudentClasses(studentId)).rejects.toThrow(
        new NotFoundException('학생을 찾을 수 없습니다.'),
      );
    });
  });

  describe('getClassDetail', () => {
    it('should return class detail successfully', async () => {
      const classId = 1;
      const mockClass = {
        id: classId,
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
          photoUrl: 'https://example.com/photo.jpg',
          introduction: '수학 전문가입니다.',
        },
        enrollments: [
          { id: 1, studentId: 1, classId: 1 },
          { id: 2, studentId: 2, classId: 1 },
        ],
      };

      mockPrismaService.class.findUnique.mockResolvedValue(mockClass);

      const result = await service.getClassDetail(classId);

      expect(prismaService.class.findUnique).toHaveBeenCalledWith({
        where: { id: classId },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
              introduction: true,
            },
          },
          enrollments: true,
        },
      });
      expect(result).toEqual(mockClass);
    });

    it('should throw NotFoundException when class not found', async () => {
      const classId = 999;
      mockPrismaService.class.findUnique.mockResolvedValue(null);

      await expect(service.getClassDetail(classId)).rejects.toThrow(
        new NotFoundException('수업을 찾을 수 없습니다.'),
      );
    });
  });

  describe('enrollClass', () => {
    it('should call classService.enrollStudent successfully', async () => {
      const classId = 1;
      const studentId = 1;
      const mockResult = { success: true };

      mockClassService.enrollStudent.mockResolvedValue(mockResult);

      const result = await service.enrollClass(classId, studentId);

      expect(classService.enrollStudent).toHaveBeenCalledWith(
        classId,
        studentId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('unenrollClass', () => {
    it('should call classService.unenrollStudent successfully', async () => {
      const classId = 1;
      const studentId = 1;
      const mockResult = { success: true };

      mockClassService.unenrollStudent.mockResolvedValue(mockResult);

      const result = await service.unenrollClass(classId, studentId);

      expect(classService.unenrollStudent).toHaveBeenCalledWith(
        classId,
        studentId,
      );
      expect(result).toEqual(mockResult);
    });
  });
});

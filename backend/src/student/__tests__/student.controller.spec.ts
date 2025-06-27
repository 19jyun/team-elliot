import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from '../student.controller';
import { StudentService } from '../student.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('StudentController', () => {
  let controller: StudentController;
  let studentService: StudentService;

  const mockStudentService = {
    getStudentClasses: jest.fn(),
    getClassDetail: jest.fn(),
    enrollClass: jest.fn(),
    unenrollClass: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'student@example.com',
    role: 'STUDENT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        {
          provide: StudentService,
          useValue: mockStudentService,
        },
      ],
    }).compile();

    controller = module.get<StudentController>(StudentController);
    studentService = module.get<StudentService>(StudentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyClasses', () => {
    it('should return student classes successfully', async () => {
      const mockClasses = [
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
      ];

      mockStudentService.getStudentClasses.mockResolvedValue(mockClasses);

      const result = await controller.getMyClasses(mockUser);

      expect(studentService.getStudentClasses).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(mockClasses);
    });
  });

  describe('getClassDetail', () => {
    it('should return class detail successfully', async () => {
      const classId = '1';
      const mockClassDetail = {
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
          photoUrl: 'https://example.com/photo.jpg',
          introduction: '수학 전문가입니다.',
        },
        enrollments: [
          { id: 1, studentId: 1, classId: 1 },
          { id: 2, studentId: 2, classId: 1 },
        ],
      };

      mockStudentService.getClassDetail.mockResolvedValue(mockClassDetail);

      const result = await controller.getClassDetail(classId);

      expect(studentService.getClassDetail).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockClassDetail);
    });

    it('should handle string class ID conversion correctly', async () => {
      const classId = '123';
      const mockClassDetail = { id: 123, name: '테스트 수업' };

      mockStudentService.getClassDetail.mockResolvedValue(mockClassDetail);

      await controller.getClassDetail(classId);

      expect(studentService.getClassDetail).toHaveBeenCalledWith(123);
    });
  });

  describe('enrollClass', () => {
    it('should enroll student in class successfully', async () => {
      const classId = '1';
      const mockEnrollmentResult = {
        success: true,
        message: '수업 등록이 완료되었습니다.',
      };

      mockStudentService.enrollClass.mockResolvedValue(mockEnrollmentResult);

      const result = await controller.enrollClass(classId, mockUser);

      expect(studentService.enrollClass).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual(mockEnrollmentResult);
    });

    it('should handle string class ID conversion correctly', async () => {
      const classId = '456';
      const mockEnrollmentResult = { success: true };

      mockStudentService.enrollClass.mockResolvedValue(mockEnrollmentResult);

      await controller.enrollClass(classId, mockUser);

      expect(studentService.enrollClass).toHaveBeenCalledWith(456, mockUser.id);
    });
  });

  describe('unenrollClass', () => {
    it('should unenroll student from class successfully', async () => {
      const classId = '1';
      const mockUnenrollmentResult = {
        success: true,
        message: '수업 취소가 완료되었습니다.',
      };

      mockStudentService.unenrollClass.mockResolvedValue(
        mockUnenrollmentResult,
      );

      const result = await controller.unenrollClass(classId, mockUser);

      expect(studentService.unenrollClass).toHaveBeenCalledWith(1, mockUser.id);
      expect(result).toEqual(mockUnenrollmentResult);
    });

    it('should handle string class ID conversion correctly', async () => {
      const classId = '789';
      const mockUnenrollmentResult = { success: true };

      mockStudentService.unenrollClass.mockResolvedValue(
        mockUnenrollmentResult,
      );

      await controller.unenrollClass(classId, mockUser);

      expect(studentService.unenrollClass).toHaveBeenCalledWith(
        789,
        mockUser.id,
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../dto/signup.dto';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  // let prismaService: PrismaService;
  // let jwtService: JwtService;

  const mockPrincipal = {
    id: 1,
    userId: 'principal123',
    password: 'hashed_principal123_password',
    name: 'Principal User',
    role: 'PRINCIPAL',
  };

  const mockTeacher = {
    id: 2,
    userId: 'teacher123',
    password: 'hashed_teacher123_password',
    name: 'Teacher User',
    role: 'TEACHER',
  };

  const mockStudent = {
    id: 3,
    userId: 'student123',
    password: 'hashed_student123_password',
    name: 'Student User',
    role: 'STUDENT',
  };

  const mockNewStudent = {
    id: 10,
    userId: 'newstudent',
    password: 'hashed_pw',
    name: 'New Student',
    phoneNumber: '010-1234-5678',
  };

  const signupDto: SignupDto = {
    userId: 'newstudent',
    password: 'plain_pw',
    name: 'New Student',
    phoneNumber: '010-1234-5678',
    role: 'STUDENT',
  };

  const mockPrismaService = {
    principal: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    withdrawalHistory: {
      create: jest.fn(),
    },
    enrollment: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // prismaService = module.get<PrismaService>(PrismaService);
    // jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate principal user correctly', async () => {
      // Arrange
      const userId = 'principal123';
      const password = 'principal123';
      const mockUser = {
        id: 1,
        userId: 'principal123',
        password: 'hashed_principal123_password',
        name: 'Principal User',
        role: 'PRINCIPAL',
      };
      const mockPrincipalData = {
        id: 1,
        userRefId: 1,
        userId: 'principal123',
        name: 'Principal User',
        phoneNumber: '010-1234-5678',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.principal.findUnique.mockResolvedValue(
        mockPrincipalData,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        userId: mockPrincipalData.userId,
        name: mockPrincipalData.name,
        phoneNumber: mockPrincipalData.phoneNumber,
        userRefId: mockPrincipalData.userRefId,
        role: 'PRINCIPAL',
      });
    });

    it('should validate teacher user correctly', async () => {
      // Arrange
      const userId = 'teacher123';
      const password = 'admin123';
      const mockUser = {
        id: 2,
        userId: 'teacher123',
        password: 'hashed_teacher123_password',
        name: 'Teacher User',
        role: 'TEACHER',
      };
      const mockTeacherData = {
        id: 2,
        userRefId: 2,
        userId: 'teacher123',
        name: 'Teacher User',
        phoneNumber: '010-1234-5678',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacherData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        userId: mockTeacherData.userId,
        name: mockTeacherData.name,
        phoneNumber: mockTeacherData.phoneNumber,
        userRefId: mockTeacherData.userRefId,
        role: 'TEACHER',
      });
    });

    it('should validate student user correctly', async () => {
      // Arrange
      const userId = 'student123';
      const password = 'admin123';
      const mockUser = {
        id: 3,
        userId: 'student123',
        password: 'hashed_student123_password',
        name: 'Student User',
        role: 'STUDENT',
      };
      const mockStudentData = {
        id: 3,
        userRefId: 3,
        userId: 'student123',
        name: 'Student User',
        phoneNumber: '010-1234-5678',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudentData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        userId: mockStudentData.userId,
        name: mockStudentData.name,
        phoneNumber: mockStudentData.phoneNumber,
        userRefId: mockStudentData.userRefId,
        role: 'STUDENT',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const userId = 'invalid';
      const password = 'wrong';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser(userId, password)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(userId, password)).rejects.toThrow(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    });
  });

  describe('login', () => {
    describe('successful login scenarios', () => {
      it('should successfully login principal with correct credentials', async () => {
        const userId = 'principal123';
        const password = 'principal123';
        const expectedToken = 'mock-jwt-token';
        const mockUser = {
          id: 1,
          userId: 'principal123',
          password: 'hashed_principal123_password',
          name: 'Principal User',
          role: 'PRINCIPAL',
        };
        const mockPrincipalData = {
          id: 1,
          userRefId: 1,
          userId: 'principal123',
          name: 'Principal User',
          phoneNumber: '010-1234-5678',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.principal.findUnique.mockResolvedValue(
          mockPrincipalData,
        );
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);

        const result = await service.login(userId, password);

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { userId: userId },
        });
        expect(mockPrismaService.principal.findUnique).toHaveBeenCalledWith({
          where: { userRefId: mockUser.id },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockUser.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockPrincipalData.userId,
          sub: mockUser.id,
          role: 'PRINCIPAL',
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockUser.id,
            userId: mockPrincipalData.userId,
            name: mockPrincipalData.name,
            role: 'PRINCIPAL',
          },
        });
      });

      it('should successfully login teacher with correct credentials', async () => {
        const userId = 'teacher123';
        const password = 'admin123';
        const expectedToken = 'mock-jwt-token';
        const mockUser = {
          id: 2,
          userId: 'teacher123',
          password: 'hashed_teacher123_password',
          name: 'Teacher User',
          role: 'TEACHER',
        };
        const mockTeacherData = {
          id: 2,
          userRefId: 2,
          userId: 'teacher123',
          name: 'Teacher User',
          phoneNumber: '010-1234-5678',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacherData);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);

        const result = await service.login(userId, password);

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { userId: userId },
        });
        expect(mockPrismaService.teacher.findUnique).toHaveBeenCalledWith({
          where: { userRefId: mockUser.id },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockUser.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockTeacherData.userId,
          sub: mockUser.id,
          role: 'TEACHER',
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockUser.id,
            userId: mockTeacherData.userId,
            name: mockTeacherData.name,
            role: 'TEACHER',
          },
        });
      });

      it('should successfully login student with correct credentials', async () => {
        const userId = 'student123';
        const password = 'admin123';
        const expectedToken = 'mock-jwt-token';
        const mockUser = {
          id: 3,
          userId: 'student123',
          password: 'hashed_student123_password',
          name: 'Student User',
          role: 'STUDENT',
        };
        const mockStudentData = {
          id: 3,
          userRefId: 3,
          userId: 'student123',
          name: 'Student User',
          phoneNumber: '010-1234-5678',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.student.findUnique.mockResolvedValue(mockStudentData);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);

        const result = await service.login(userId, password);

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { userId },
        });
        expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
          where: { userRefId: mockUser.id },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockUser.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockStudentData.userId,
          sub: mockUser.id,
          role: 'STUDENT',
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockUser.id,
            userId: mockStudentData.userId,
            name: mockStudentData.name,
            role: 'STUDENT',
          },
        });
      });
    });

    describe('failed login scenarios', () => {
      it('should throw UnauthorizedException for non-existent user', async () => {
        const userId = 'nonexistent_user';
        const password = 'password123';

        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(userId, password)).rejects.toThrow(
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      });

      it('should throw UnauthorizedException for principal with wrong password', async () => {
        const userId = 'principal123';
        const password = 'wrong_password';
        const mockUser = {
          id: 1,
          userId: 'principal123',
          password: 'hashed_principal123_password',
          name: 'Principal User',
          role: 'PRINCIPAL',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(userId, password)).rejects.toThrow(
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      });

      it('should throw UnauthorizedException for teacher with wrong password', async () => {
        const userId = 'teacher123';
        const password = 'wrong_password';
        const mockUser = {
          id: 2,
          userId: 'teacher123',
          password: 'hashed_teacher123_password',
          name: 'Teacher User',
          role: 'TEACHER',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(userId, password)).rejects.toThrow(
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      });

      it('should throw UnauthorizedException for student with wrong password', async () => {
        const userId = 'student123';
        const password = 'wrong_password';
        const mockUser = {
          id: 3,
          userId: 'student123',
          password: 'hashed_student123_password',
          name: 'Student User',
          role: 'STUDENT',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(userId, password)).rejects.toThrow(
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      });
    });
  });

  describe('signup', () => {
    it('should signup a new student and return access_token and user info', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');

      // 트랜잭션 Mock 설정
      const mockUser = {
        id: 100,
        userId: signupDto.userId,
        name: signupDto.name,
        role: 'STUDENT',
      };
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockPrisma = {
          student: {
            create: jest.fn().mockResolvedValue(mockNewStudent),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
        };
        return await callback(mockPrisma);
      });

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.signup(signupDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: signupDto.userId },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        userId: mockNewStudent.userId,
        role: 'STUDENT',
      });
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          userId: mockNewStudent.userId,
          name: mockNewStudent.name,
          role: 'STUDENT',
        },
      });
    });

    it('should throw ConflictException if userId already exists', async () => {
      const existingUser = {
        id: 1,
        userId: 'newstudent',
        name: 'Existing User',
        role: 'STUDENT',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        '이미 사용중인 아이디입니다.',
      );
    });

    it('should handle errors during password hashing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('hash error'));

      await expect(service.signup(signupDto)).rejects.toThrow('hash error');
    });

    it('should handle errors during student creation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');

      // 트랜잭션 Mock에서 에러 발생
      mockPrismaService.$transaction.mockRejectedValue(new Error('db error'));

      await expect(service.signup(signupDto)).rejects.toThrow('db error');
    });
  });

  describe('withdrawal', () => {
    it('should delete student account successfully', async () => {
      const userId = 3;
      const reason = '개인적인 이유';
      const mockUser = {
        id: userId,
        userId: 'student123',
        name: 'Student User',
        role: 'STUDENT',
      };
      const mockStudentData = {
        id: 3,
        userRefId: userId,
        userId: 'student123',
        name: 'Student User',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudentData);
      mockPrismaService.withdrawalHistory.create.mockResolvedValue({});
      mockPrismaService.$transaction.mockResolvedValue([]);

      await service.withdrawal(userId, reason);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userRefId: userId },
      });
      expect(mockPrismaService.withdrawalHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.userId,
          userName: mockUser.name,
          userRole: 'STUDENT',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.enrollment.deleteMany({
          where: { studentId: mockStudentData.id },
        }),
        mockPrismaService.student.delete({
          where: { id: mockStudentData.id },
        }),
        mockPrismaService.user.delete({
          where: { id: userId },
        }),
      ]);
    });

    it('should throw NotFoundException for non-existent student', async () => {
      const userId = 999;
      const reason = '개인적인 이유';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.withdrawal(userId, reason)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.withdrawal(userId, reason)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });

  describe('checkUserId', () => {
    it('should return available: true when userId is not used', async () => {
      const userId = 'newuser';

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.checkUserId(userId);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual({ available: true });
    });

    it('should return available: false when userId exists in user table', async () => {
      const userId = 'existinguser';
      const existingUser = {
        id: 1,
        userId: 'existinguser',
        name: 'Existing User',
        role: 'STUDENT',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      const result = await service.checkUserId(userId);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual({ available: false });
    });
  });
});

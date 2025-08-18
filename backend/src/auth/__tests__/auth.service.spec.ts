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

      mockPrismaService.principal.findUnique.mockResolvedValue(mockPrincipal);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockPrincipal.id,
        userId: mockPrincipal.userId,
        name: mockPrincipal.name,
        role: 'PRINCIPAL',
      });
    });

    it('should validate teacher user correctly', async () => {
      // Arrange
      const userId = 'teacher123';
      const password = 'admin123';

      mockPrismaService.principal.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockTeacher.id,
        userId: mockTeacher.userId,
        name: mockTeacher.name,
        role: 'TEACHER',
      });
    });

    it('should validate student user correctly', async () => {
      // Arrange
      const userId = 'student123';
      const password = 'admin123';

      mockPrismaService.principal.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockStudent.id,
        userId: mockStudent.userId,
        name: mockStudent.name,
        role: 'STUDENT',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      const userId = 'invalid';
      const password = 'wrong';

      mockPrismaService.principal.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);
      mockPrismaService.student.findUnique.mockResolvedValue(null);

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

        mockPrismaService.principal.findUnique.mockResolvedValue(mockPrincipal);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);

        const result = await service.login(userId, password);

        expect(mockPrismaService.principal.findUnique).toHaveBeenCalledWith({
          where: { userId: userId },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockPrincipal.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockPrincipal.userId,
          sub: mockPrincipal.id,
          role: 'PRINCIPAL',
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockPrincipal.id,
            userId: mockPrincipal.userId,
            name: mockPrincipal.name,
            role: 'PRINCIPAL',
          },
        });
      });

      it('should successfully login teacher with correct credentials', async () => {
        const userId = 'teacher123';
        const password = 'admin123';
        const expectedToken = 'mock-jwt-token';

        mockPrismaService.principal.findUnique.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);

        const result = await service.login(userId, password);

        expect(mockPrismaService.teacher.findUnique).toHaveBeenCalledWith({
          where: { userId: userId },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockTeacher.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockTeacher.userId,
          sub: mockTeacher.id,
          role: 'TEACHER',
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockTeacher.id,
            userId: mockTeacher.userId,
            name: mockTeacher.name,
            role: 'TEACHER',
          },
        });
      });

      it('should successfully login student with correct credentials', async () => {
        const userId = 'student123';
        const password = 'admin123';
        const expectedToken = 'mock-jwt-token';

        mockPrismaService.principal.findUnique.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(null);
        mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);

        const result = await service.login(userId, password);

        expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
          where: { userId },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockStudent.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockStudent.userId,
          sub: mockStudent.id,
          role: 'STUDENT',
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockStudent.id,
            userId: mockStudent.userId,
            name: mockStudent.name,
            role: 'STUDENT',
          },
        });
      });
    });

    describe('failed login scenarios', () => {
      it('should throw UnauthorizedException for non-existent user', async () => {
        const userId = 'nonexistent_user';
        const password = 'password123';

        mockPrismaService.principal.findUnique.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(null);
        mockPrismaService.student.findUnique.mockResolvedValue(null);

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

        mockPrismaService.principal.findUnique.mockResolvedValue(mockPrincipal);
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

        mockPrismaService.principal.findUnique.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);
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

        mockPrismaService.principal.findUnique.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(null);
        mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
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
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockPrismaService.student.create.mockResolvedValue(mockNewStudent);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.signup(signupDto);

      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { userId: signupDto.userId },
      });
      expect(mockPrismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { userId: signupDto.userId },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 10);
      expect(mockPrismaService.student.create).toHaveBeenCalledWith({
        data: {
          userId: signupDto.userId,
          password: 'hashed_pw',
          name: signupDto.name,
          phoneNumber: signupDto.phoneNumber,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockNewStudent.id,
        userId: mockNewStudent.userId,
        role: 'STUDENT',
      });
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockNewStudent.id,
          userId: mockNewStudent.userId,
          name: mockNewStudent.name,
          role: 'STUDENT',
        },
      });
    });

    it('should throw ConflictException if userId already exists in student table', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        '이미 사용중인 아이디입니다.',
      );
    });

    it('should throw ConflictException if userId already exists in teacher table', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(mockTeacher);

      await expect(service.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(signupDto)).rejects.toThrow(
        '이미 사용중인 아이디입니다.',
      );
    });

    it('should handle errors during password hashing', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('hash error'));

      await expect(service.signup(signupDto)).rejects.toThrow('hash error');
    });

    it('should handle errors during student creation', async () => {
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      mockPrismaService.teacher.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockPrismaService.student.create.mockRejectedValue(new Error('db error'));

      await expect(service.signup(signupDto)).rejects.toThrow('db error');
    });
  });

  describe('withdrawal', () => {
    it('should delete student account successfully', async () => {
      const userId = 3;
      const reason = '개인적인 이유';

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
      mockPrismaService.withdrawalHistory.create.mockResolvedValue({});
      mockPrismaService.$transaction.mockResolvedValue([]);

      await service.withdrawal(userId, reason);

      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.withdrawalHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockStudent.userId,
          userName: mockStudent.name,
          userRole: 'STUDENT',
          reason: reason,
          reasonCategory: 'OTHER',
        },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        mockPrismaService.enrollment.deleteMany({
          where: { studentId: userId },
        }),
        mockPrismaService.student.delete({
          where: { id: userId },
        }),
      ]);
    });

    it('should throw NotFoundException for non-existent student', async () => {
      const userId = 999;
      const reason = '개인적인 이유';

      mockPrismaService.student.findUnique.mockResolvedValue(null);

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

      mockPrismaService.student.findFirst.mockResolvedValue(null);

      const result = await service.checkUserId(userId);

      expect(mockPrismaService.student.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual({ available: true });
    });

    it('should return available: false when userId exists in student table', async () => {
      const userId = 'existinguser';

      mockPrismaService.student.findFirst.mockResolvedValue(mockStudent);

      const result = await service.checkUserId(userId);

      expect(mockPrismaService.student.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual({ available: false });
    });
  });
});

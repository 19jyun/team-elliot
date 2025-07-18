import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockAdmin = {
    id: 1,
    userId: 'admin123',
    password: 'hashed_admin123_password',
    name: 'Admin User',
    role: 'ADMIN',
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

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
    },
    teacher: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
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
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate admin user correctly', async () => {
      // Arrange
      const userId = 'admin123';
      const password = 'admin123';

      mockPrismaService.user.findFirst.mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(userId, password);

      // Assert
      expect(result).toEqual({
        id: mockAdmin.id,
        userId: mockAdmin.userId,
        name: mockAdmin.name,
        role: mockAdmin.role,
      });
    });

    it('should validate teacher user correctly', async () => {
      // Arrange
      const userId = 'teacher123';
      const password = 'admin123';

      mockPrismaService.user.findFirst.mockResolvedValue(null);
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

      mockPrismaService.user.findFirst.mockResolvedValue(null);
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
  });
});

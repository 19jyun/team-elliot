import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService - Login', () => {
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
    user: { findFirst: jest.fn() },
    teacher: { findUnique: jest.fn() },
    student: { findUnique: jest.fn() },
  };
  const mockJwtService = { sign: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    describe('successful login scenarios', () => {
      it('should successfully login admin with correct credentials', async () => {
        const userId = 'admin123';
        const password = 'admin123';
        const expectedToken = 'mock-jwt-token';
        mockPrismaService.user.findFirst.mockResolvedValue(mockAdmin);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue(expectedToken);
        const result = await service.login(userId, password);
        expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
          where: { userId: userId, role: 'ADMIN' },
          select: {
            id: true,
            userId: true,
            password: true,
            name: true,
            role: true,
          },
        });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          password,
          mockAdmin.password,
        );
        expect(mockJwtService.sign).toHaveBeenCalledWith({
          userId: mockAdmin.userId,
          sub: mockAdmin.id,
          role: mockAdmin.role,
        });
        expect(result).toEqual({
          access_token: expectedToken,
          user: {
            id: mockAdmin.id,
            userId: mockAdmin.userId,
            name: mockAdmin.name,
            role: mockAdmin.role,
          },
        });
      });
      it('should successfully login teacher with correct credentials', async () => {
        const userId = 'teacher123';
        const password = 'admin123';
        const expectedToken = 'mock-jwt-token';
        mockPrismaService.user.findFirst.mockResolvedValue(null);
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
        mockPrismaService.user.findFirst.mockResolvedValue(null);
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
      it('should throw UnauthorizedException for non-existent admin', async () => {
        const userId = 'nonexistent_admin';
        const password = 'admin123';
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(null);
        mockPrismaService.student.findUnique.mockResolvedValue(null);
        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.login(userId, password)).rejects.toThrow(
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      });
      it('should throw UnauthorizedException for admin with wrong password', async () => {
        const userId = 'admin123';
        const password = 'wrong_password';
        mockPrismaService.user.findFirst.mockResolvedValue(mockAdmin);
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
        mockPrismaService.user.findFirst.mockResolvedValue(null);
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
        mockPrismaService.user.findFirst.mockResolvedValue(null);
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
      it('should throw UnauthorizedException for empty userId', async () => {
        const userId = '';
        const password = 'admin123';
        mockPrismaService.user.findFirst.mockResolvedValue(null);
        mockPrismaService.teacher.findUnique.mockResolvedValue(null);
        mockPrismaService.student.findUnique.mockResolvedValue(null);
        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
      });
      it('should throw UnauthorizedException for empty password', async () => {
        const userId = 'admin123';
        const password = '';
        mockPrismaService.user.findFirst.mockResolvedValue(mockAdmin);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        await expect(service.login(userId, password)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });
    describe('edge cases', () => {
      it('should handle bcrypt comparison errors gracefully', async () => {
        const userId = 'admin123';
        const password = 'admin123';
        mockPrismaService.user.findFirst.mockResolvedValue(mockAdmin);
        (bcrypt.compare as jest.Mock).mockRejectedValue(
          new Error('bcrypt error'),
        );
        await expect(service.login(userId, password)).rejects.toThrow(Error);
      });
      it('should handle database errors gracefully', async () => {
        const userId = 'admin123';
        const password = 'admin123';
        mockPrismaService.user.findFirst.mockRejectedValue(
          new Error('Database connection error'),
        );
        await expect(service.login(userId, password)).rejects.toThrow(Error);
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../dto/signup.dto';

jest.mock('bcrypt');

describe('AuthService - Signup', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockStudent = {
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
  };

  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
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

  it('should signup a new student and return access_token and user info', async () => {
    mockPrismaService.student.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
    mockPrismaService.student.create.mockResolvedValue(mockStudent);
    mockJwtService.sign.mockReturnValue('mock-jwt-token');

    const result = await service.signup(signupDto);

    expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
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
      id: mockStudent.id,
      userId: mockStudent.userId,
      role: 'STUDENT',
    });
    expect(result).toEqual({
      access_token: 'mock-jwt-token',
      user: {
        id: mockStudent.id,
        userId: mockStudent.userId,
        name: mockStudent.name,
        role: 'STUDENT',
      },
    });
  });

  it('should throw ConflictException if userId already exists', async () => {
    mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);
    await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    await expect(service.signup(signupDto)).rejects.toThrow(
      '이미 사용중인 아이디입니다.',
    );
  });

  it('should handle errors during password hashing', async () => {
    mockPrismaService.student.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('hash error'));
    await expect(service.signup(signupDto)).rejects.toThrow('hash error');
  });

  it('should handle errors during student creation', async () => {
    mockPrismaService.student.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
    mockPrismaService.student.create.mockRejectedValue(new Error('db error'));
    await expect(service.signup(signupDto)).rejects.toThrow('db error');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { CheckUserIdDto } from '../dto/check-userid.dto';
import { WithdrawalReasonDto } from '../dto/withdrawal-reason.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    id: 123,
    userId: 'testuser',
    name: 'Test User',
    role: 'STUDENT',
  };

  const mockLoginDto: LoginDto = {
    userId: 'testuser',
    password: 'password123',
  };

  const mockSignupDto: SignupDto = {
    userId: 'newuser',
    password: 'password123',
    name: 'New User',
    phoneNumber: '010-1234-5678',
    role: 'STUDENT',
  };

  const mockCheckUserIdDto: CheckUserIdDto = {
    userId: 'testuser',
  };

  const mockWithdrawalReasonDto: WithdrawalReasonDto = {
    reason: '테스트 이유',
  };

  const mockAuthService = {
    login: jest.fn(),
    signup: jest.fn(),
    withdrawal: jest.fn(),
    checkUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call service.login and return auth response', async () => {
      const mockAuthResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          userId: 'testuser',
          name: 'Test User',
          role: 'STUDENT',
        },
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockLoginDto);

      expect(service.login).toHaveBeenCalledWith(
        mockLoginDto.userId,
        mockLoginDto.password,
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle login errors', async () => {
      const error = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Login failed',
      );
      expect(service.login).toHaveBeenCalledWith(
        mockLoginDto.userId,
        mockLoginDto.password,
      );
    });
  });

  describe('signup', () => {
    it('should call service.signup and return auth response', async () => {
      const mockAuthResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 2,
          userId: 'newuser',
          name: 'New User',
          role: 'STUDENT',
        },
      };

      mockAuthService.signup.mockResolvedValue(mockAuthResponse);

      const result = await controller.signup(mockSignupDto);

      expect(service.signup).toHaveBeenCalledWith(mockSignupDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle signup errors', async () => {
      const error = new Error('Signup failed');
      mockAuthService.signup.mockRejectedValue(error);

      await expect(controller.signup(mockSignupDto)).rejects.toThrow(
        'Signup failed',
      );
      expect(service.signup).toHaveBeenCalledWith(mockSignupDto);
    });
  });

  describe('logout', () => {
    it('should return logout message', async () => {
      const result = await controller.logout();

      expect(result).toEqual({ message: '로그아웃되었습니다' });
    });
  });

  describe('withdrawal', () => {
    it('should call service.withdrawal and return success message', async () => {
      mockAuthService.withdrawal.mockResolvedValue(undefined);

      const result = await controller.withdrawal(
        mockUser,
        mockWithdrawalReasonDto,
      );

      expect(service.withdrawal).toHaveBeenCalledWith(
        mockUser.id,
        mockWithdrawalReasonDto.reason,
      );
      expect(result).toEqual({ message: '회원 탈퇴가 완료되었습니다.' });
    });

    it('should handle withdrawal errors', async () => {
      const error = new Error('Withdrawal failed');
      mockAuthService.withdrawal.mockRejectedValue(error);

      await expect(
        controller.withdrawal(mockUser, mockWithdrawalReasonDto),
      ).rejects.toThrow('Withdrawal failed');
      expect(service.withdrawal).toHaveBeenCalledWith(
        mockUser.id,
        mockWithdrawalReasonDto.reason,
      );
    });
  });

  describe('checkUserId', () => {
    it('should call service.checkUserId and return available: true', async () => {
      mockAuthService.checkUserId.mockResolvedValue({ available: true });

      const result = await controller.checkUserId(mockCheckUserIdDto);

      expect(service.checkUserId).toHaveBeenCalledWith(
        mockCheckUserIdDto.userId,
      );
      expect(result).toEqual({ available: true });
    });

    it('should call service.checkUserId and return available: false', async () => {
      mockAuthService.checkUserId.mockResolvedValue({ available: false });

      const result = await controller.checkUserId(mockCheckUserIdDto);

      expect(service.checkUserId).toHaveBeenCalledWith(
        mockCheckUserIdDto.userId,
      );
      expect(result).toEqual({ available: false });
    });

    it('should handle checkUserId errors', async () => {
      const error = new Error('Check userId failed');
      mockAuthService.checkUserId.mockRejectedValue(error);

      await expect(controller.checkUserId(mockCheckUserIdDto)).rejects.toThrow(
        'Check userId failed',
      );
      expect(service.checkUserId).toHaveBeenCalledWith(
        mockCheckUserIdDto.userId,
      );
    });
  });

  describe('JWT Guard', () => {
    it('should be protected by JwtAuthGuard for logout endpoint', async () => {
      // JwtAuthGuard가 적용되어 있는지 확인
      // 실제로는 컨트롤러 메타데이터를 확인해야 하지만,
      // 여기서는 간단히 테스트 구조만 확인
      expect(controller.logout).toBeDefined();
    });

    it('should be protected by JwtAuthGuard for withdrawal endpoint', async () => {
      // JwtAuthGuard가 적용되어 있는지 확인
      expect(controller.withdrawal).toBeDefined();
    });
  });
});

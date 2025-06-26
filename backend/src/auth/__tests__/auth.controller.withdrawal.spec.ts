import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WithdrawalReasonDto } from '../dto/withdrawal-reason.dto';

describe('AuthController - Withdrawal', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = { id: 123 };
  const mockDto: WithdrawalReasonDto = { reason: '테스트 이유' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            withdrawal: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should call service.withdrawal and return success message', async () => {
    const spy = jest.spyOn(service, 'withdrawal').mockResolvedValue(undefined);
    const result = await controller.withdrawal(mockUser, mockDto);
    expect(spy).toHaveBeenCalledWith(mockUser.id, mockDto.reason);
    expect(result).toEqual({ message: '회원 탈퇴가 완료되었습니다.' });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CheckUserIdDto } from '../dto/check-userid.dto';

describe('AuthController - CheckUserId', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            checkUserId: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should call service.checkUserId and return result', async () => {
    const dto: CheckUserIdDto = { userId: 'testuser' };
    jest.spyOn(service, 'checkUserId').mockResolvedValue({ available: true });
    const result = await controller.checkUserId(dto);
    expect(service.checkUserId).toHaveBeenCalledWith(dto.userId);
    expect(result).toEqual({ available: true });
  });
});

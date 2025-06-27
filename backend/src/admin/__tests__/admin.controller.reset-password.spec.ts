import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

describe('AdminController - Reset Password endpoint', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            resetStudentPassword: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should reset student password', async () => {
    const dto: ResetPasswordDto = { newPassword: 'newpw' };
    const result = { message: '비밀번호 초기화 성공' };
    jest.spyOn(service, 'resetStudentPassword').mockResolvedValue(result);
    await expect(controller.resetStudentPassword('1', dto)).resolves.toBe(
      result,
    );
    expect(service.resetStudentPassword).toHaveBeenCalledWith(
      1,
      dto.newPassword,
    );
  });
});

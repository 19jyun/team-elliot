import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';

describe('AdminController - DELETE endpoints', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            deleteStudent: jest.fn(),
            deleteTeacher: jest.fn(),
            deleteClass: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should delete a student', () => {
    jest.spyOn(service, 'deleteStudent').mockReturnValue(undefined);
    expect(controller.deleteStudent('1')).toBe(undefined);
    expect(service.deleteStudent).toHaveBeenCalledWith(1);
  });

  it('should delete a teacher', () => {
    jest.spyOn(service, 'deleteTeacher').mockReturnValue(undefined);
    expect(controller.deleteTeacher('2')).toBe(undefined);
    expect(service.deleteTeacher).toHaveBeenCalledWith(2);
  });

  it('should delete a class', () => {
    jest.spyOn(service, 'deleteClass').mockReturnValue(undefined);
    expect(controller.deleteClass('3')).toBe(undefined);
    expect(service.deleteClass).toHaveBeenCalledWith(3);
  });
});

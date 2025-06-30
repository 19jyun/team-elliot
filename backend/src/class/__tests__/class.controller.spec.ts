import { Test, TestingModule } from '@nestjs/testing';
import { ClassController } from '../class.controller';
import { ClassService } from '../class.service';

describe('ClassController', () => {
  let controller: ClassController;
  let service: ClassService;

  const mockService = {
    getClassDetails: jest.fn(),
    getAllClasses: jest.fn(),
    createClass: jest.fn(),
    updateClass: jest.fn(),
    deleteClass: jest.fn(),
    enrollStudent: jest.fn(),
    unenrollStudent: jest.fn(),
    getClassesByMonth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassController],
      providers: [{ provide: ClassService, useValue: mockService }],
    }).compile();
    controller = module.get<ClassController>(ClassController);
    service = module.get<ClassService>(ClassService);
    jest.clearAllMocks();
  });

  it('should get class details', async () => {
    const details = { id: 1 };
    mockService.getClassDetails.mockResolvedValue(details);
    await expect(controller.getClassDetails(1)).resolves.toBe(details);
  });

  it('should get all classes', async () => {
    const classes = [{ id: 1 }];
    mockService.getAllClasses.mockResolvedValue(classes);
    await expect(controller.getAllClasses(undefined, undefined)).resolves.toBe(
      classes,
    );
  });

  it('should create a class', async () => {
    const dto = {
      className: 'Test Class',
      description: 'Test Description',
      maxStudents: 10,
      tuitionFee: 100000,
      teacherId: 1,
      dayOfWeek: 'MONDAY',
      startTime: '14:00',
      endTime: '15:00',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      level: 'BEGINNER',
      backgroundColor: '#F8F9FA',
    };
    const created = { id: 1, ...dto };
    mockService.createClass.mockResolvedValue(created);
    await expect(controller.createClass(dto)).resolves.toBe(created);
  });

  it('should update a class', async () => {
    const updated = { id: 1, className: 'B' };
    mockService.updateClass.mockResolvedValue(updated);
    await expect(controller.updateClass(1, { className: 'B' })).resolves.toBe(
      updated,
    );
  });

  it('should delete a class', async () => {
    mockService.deleteClass.mockResolvedValue({ id: 1 });
    await expect(controller.deleteClass(1)).resolves.toEqual({ id: 1 });
  });

  it('should enroll a student', async () => {
    mockService.enrollStudent.mockResolvedValue({ id: 1 });
    await expect(controller.enrollClass(1, 2)).resolves.toEqual({ id: 1 });
  });

  it('should unenroll a student', async () => {
    mockService.unenrollStudent.mockResolvedValue({ id: 1 });
    await expect(controller.unenrollClass(1, 2)).resolves.toEqual({ id: 1 });
  });

  it('should get classes by month', async () => {
    const classes = [{ id: 1 }];
    mockService.getClassesByMonth.mockResolvedValue(classes);
    await expect(controller.getClassesByMonth('07', '2024')).resolves.toBe(
      classes,
    );
  });
});

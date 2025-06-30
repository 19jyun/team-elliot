import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { Decimal } from '@prisma/client/runtime/library';

describe('AdminController - CREATE endpoints', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            createStudent: jest.fn(),
            createTeacher: jest.fn(),
            createClass: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should create a student', async () => {
    const dto: CreateStudentDto = {
      userId: 's1',
      password: 'pw',
      name: 'n',
      phoneNumber: '01011110101',
    };
    const student = {
      id: 1,
      userId: dto.userId,
      password: dto.password,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      emergencyContact: '',
      birthDate: new Date(),
      notes: '',
      level: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(service, 'createStudent').mockResolvedValue(student);
    await expect(controller.createStudent(dto)).resolves.toBe(student);
  });

  it('should create a teacher', async () => {
    const dto: CreateTeacherDto = {
      userId: 't1',
      password: 'pw',
      name: 'n',
      introduction: '',
      photoUrl: '',
      education: [],
    };
    const teacher = {
      id: 1,
      userId: dto.userId,
      password: dto.password,
      name: dto.name,
      phoneNumber: '01011110101',
      createdAt: new Date(),
      updatedAt: new Date(),
      introduction: dto.introduction,
      photoUrl: dto.photoUrl,
      education: dto.education,
      specialties: [],
      certifications: [],
      yearsOfExperience: 1,
      availableTimes: {},
    };
    jest.spyOn(service, 'createTeacher').mockResolvedValue(teacher);
    await expect(controller.createTeacher(dto)).resolves.toBe(teacher);
  });

  it('should create a class', async () => {
    const createClassDto: CreateClassDto = {
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
    const classObj = {
      id: 1,
      className: createClassDto.className,
      classCode: 'C001',
      description: createClassDto.description,
      maxStudents: createClassDto.maxStudents,
      currentStudents: 0,
      tuitionFee: new Decimal(createClassDto.tuitionFee),
      teacherId: createClassDto.teacherId,
      dayOfWeek: createClassDto.dayOfWeek,
      startTime: new Date('1970-01-01T14:00:00Z'),
      endTime: new Date('1970-01-01T15:00:00Z'),
      startDate: createClassDto.startDate,
      endDate: createClassDto.endDate,
      level: createClassDto.level,
      backgroundColor: createClassDto.backgroundColor,
      status: 'ACTIVE',
      registrationMonth: new Date(
        createClassDto.startDate.getFullYear(),
        createClassDto.startDate.getMonth(),
        1,
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      classDetailId: 1,
      registrationStartDate: new Date(),
      registrationEndDate: new Date(),
    };
    jest.spyOn(service, 'createClass').mockResolvedValue(classObj);
    await expect(controller.createClass(createClassDto)).resolves.toBe(
      classObj,
    );
  });
});

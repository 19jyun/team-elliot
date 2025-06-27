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
    const dto: CreateClassDto = {
      className: 'class',
      description: 'desc',
      maxStudents: 20,
      tuitionFee: 100000,
      teacherId: 1,
      dayOfWeek: '월',
      time: '14:00',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-08-31'),
      level: 'BEGINNER',
      backgroundColor: '#F8F9FA',
    };
    const classObj = {
      id: 1,
      className: dto.className,
      classCode: 'C001',
      description: dto.description,
      maxStudents: dto.maxStudents,
      currentStudents: 0,
      tuitionFee: new Decimal(dto.tuitionFee),
      teacherId: dto.teacherId,
      dayOfWeek: dto.dayOfWeek,
      time: new Date('1970-01-01T${dto.time}:00Z'),
      startDate: dto.startDate,
      endDate: dto.endDate,
      level: dto.level,
      backgroundColor: dto.backgroundColor,
      status: 'ACTIVE',
      registrationMonth: new Date(
        dto.startDate.getFullYear(),
        dto.startDate.getMonth(),
        1,
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      classDetailId: 1,
      registrationStartDate: new Date(),
      registrationEndDate: new Date(),
    };
    jest.spyOn(service, 'createClass').mockResolvedValue(classObj);
    await expect(controller.createClass(dto)).resolves.toBe(classObj);
  });
});

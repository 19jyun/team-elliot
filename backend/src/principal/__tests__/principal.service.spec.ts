import { Test, TestingModule } from '@nestjs/testing';
import { PrincipalService } from '../principal.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../../socket/socket.gateway';
import { ClassService } from '../../class/class.service';
import { ClassSessionService } from '../../class-session/class-session.service';
import { RefundService } from '../../refund/refund.service';
import { TeacherService } from '../../teacher/teacher.service';
import { StudentService } from '../../student/student.service';
import { UpdateAcademyDto } from '../dto/update-academy.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { NotFoundException } from '@nestjs/common';

describe('PrincipalService', () => {
  let service: PrincipalService;
  let prisma: any;
  // let socketGateway: any;
  let classService: any;
  let classSessionService: any;
  let refundService: any;
  let teacherService: any;
  let studentService: any;

  const mockPrisma = {
    principal: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    academy: {
      update: jest.fn(),
    },
    sessionEnrollment: {
      findMany: jest.fn(),
    },
    refundRequest: {
      findMany: jest.fn(),
    },
  };

  const mockSocketGateway = {
    emitToUser: jest.fn(),
  };

  const mockClassService = {
    getPrincipalClasses: jest.fn(),
  };

  const mockClassSessionService = {
    getPrincipalSessions: jest.fn(),
    getPrincipalEnrollments: jest.fn(),
    getPrincipalSessionEnrollments: jest.fn(),
    getPrincipalSessionsWithEnrollmentRequests: jest.fn(),
  };

  const mockRefundService = {
    getPrincipalRefundRequests: jest.fn(),
    getPrincipalSessionsWithRefundRequests: jest.fn(),
  };

  const mockTeacherService = {
    getPrincipalTeachers: jest.fn(),
  };

  const mockStudentService = {
    getPrincipalStudents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrincipalService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SocketGateway, useValue: mockSocketGateway },
        { provide: ClassService, useValue: mockClassService },
        { provide: ClassSessionService, useValue: mockClassSessionService },
        { provide: RefundService, useValue: mockRefundService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: StudentService, useValue: mockStudentService },
      ],
    }).compile();
    service = module.get<PrincipalService>(PrincipalService);
    prisma = module.get<PrismaService>(PrismaService);
    // socketGateway = module.get<SocketGateway>(SocketGateway);
    classService = module.get<ClassService>(ClassService);
    classSessionService = module.get<ClassSessionService>(ClassSessionService);
    refundService = module.get<RefundService>(RefundService);
    teacherService = module.get<TeacherService>(TeacherService);
    studentService = module.get<StudentService>(StudentService);
    jest.clearAllMocks();
  });

  describe('getMyAcademy', () => {
    it('should get principal academy successfully', async () => {
      const principalId = 1;
      const academy = {
        id: 1,
        name: 'Test Academy',
        teachers: [],
        classes: [],
        students: [],
      };
      const principal = { id: principalId, academy };

      prisma.principal.findUnique.mockResolvedValue(principal);

      const result = await service.getMyAcademy(principalId);

      expect(result).toEqual(academy);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { id: principalId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const principalId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getMyAcademy(principalId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllSessions', () => {
    it('should get all sessions', async () => {
      const principalId = 1;
      const sessions = [{ id: 1, classId: 1, date: new Date() }];

      classSessionService.getPrincipalSessions.mockResolvedValue(sessions);

      const result = await service.getAllSessions(principalId);

      expect(result).toEqual(sessions);
      expect(classSessionService.getPrincipalSessions).toHaveBeenCalledWith(
        principalId,
      );
    });
  });

  describe('getAllClasses', () => {
    it('should get all classes', async () => {
      const principalId = 1;
      const classes = [{ id: 1, className: 'Test Class' }];

      classService.getPrincipalClasses.mockResolvedValue(classes);

      const result = await service.getAllClasses(principalId);

      expect(result).toEqual(classes);
      expect(classService.getPrincipalClasses).toHaveBeenCalledWith(
        principalId,
      );
    });
  });

  describe('getAllTeachers', () => {
    it('should get all teachers', async () => {
      const principalId = 1;
      const teachers = [{ id: 1, name: 'Test Teacher' }];

      teacherService.getPrincipalTeachers.mockResolvedValue(teachers);

      const result = await service.getAllTeachers(principalId);

      expect(result).toEqual(teachers);
      expect(teacherService.getPrincipalTeachers).toHaveBeenCalledWith(
        principalId,
      );
    });
  });

  describe('getAllStudents', () => {
    it('should get all students', async () => {
      const principalId = 1;
      const students = [{ id: 1, name: 'Test Student' }];

      studentService.getPrincipalStudents.mockResolvedValue(students);

      const result = await service.getAllStudents(principalId);

      expect(result).toEqual(students);
      expect(studentService.getPrincipalStudents).toHaveBeenCalledWith(
        principalId,
      );
    });
  });

  describe('getAllEnrollments', () => {
    it('should get all enrollments', async () => {
      const principalId = 1;
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];

      classSessionService.getPrincipalEnrollments.mockResolvedValue(
        enrollments,
      );

      const result = await service.getAllEnrollments(principalId);

      expect(result).toEqual(enrollments);
      expect(classSessionService.getPrincipalEnrollments).toHaveBeenCalledWith(
        principalId,
      );
    });
  });

  describe('getAllRefundRequests', () => {
    it('should get all refund requests', async () => {
      const principalId = 1;
      const refundRequests = [{ id: 1, studentId: 1, amount: 50000 }];

      refundService.getPrincipalRefundRequests.mockResolvedValue(
        refundRequests,
      );

      const result = await service.getAllRefundRequests(principalId);

      expect(result).toEqual(refundRequests);
      expect(refundService.getPrincipalRefundRequests).toHaveBeenCalledWith(
        principalId,
      );
    });
  });

  describe('getPrincipalInfo', () => {
    it('should get principal info successfully', async () => {
      const principalId = 1;
      const principalInfo = {
        id: principalId,
        name: 'Test Principal',
        email: 'test@example.com',
        phoneNumber: '010-1234-5678',
      };

      prisma.principal.findUnique.mockResolvedValue(principalInfo);

      const result = await service.getPrincipalInfo(principalId);

      expect(result).toEqual(principalInfo);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { id: principalId },
        include: { academy: true },
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const principalId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getPrincipalInfo(principalId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPrincipalBankInfo', () => {
    it('should get principal bank info successfully', async () => {
      const principalId = 1;
      const bankInfo = {
        principalId: 1,
        principalName: 'Test Principal',
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Principal',
      };

      prisma.principal.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Principal',
        bankName: 'Test Bank',
        accountNumber: '123-456-789',
        accountHolder: 'Test Principal',
      });

      const result = await service.getPrincipalBankInfo(principalId);

      expect(result).toEqual(bankInfo);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { id: principalId },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const principalId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getPrincipalBankInfo(principalId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update principal profile successfully', async () => {
      const principalId = 1;
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Principal',
        phoneNumber: '010-1234-5678',
        introduction: 'Updated introduction',
      };
      const updatedProfile = { id: principalId, ...updateProfileDto };

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      prisma.principal.update.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(principalId, updateProfileDto);

      expect(result).toEqual(updatedProfile);
      expect(prisma.principal.update).toHaveBeenCalledWith({
        where: { id: principalId },
        data: updateProfileDto,
        include: { academy: true },
      });
    });
  });

  describe('updateAcademy', () => {
    it('should update academy successfully', async () => {
      const principalId = 1;
      const updateAcademyDto: UpdateAcademyDto = {
        name: 'Updated Academy',
        phoneNumber: '02-1234-5678',
        address: 'Updated Address',
      };
      const updatedAcademy = { id: 1, ...updateAcademyDto };

      prisma.principal.findUnique.mockResolvedValue({
        id: principalId,
        academyId: 1,
      });
      prisma.academy.update.mockResolvedValue(updatedAcademy);

      const result = await service.updateAcademy(principalId, updateAcademyDto);

      expect(result).toEqual(updatedAcademy);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { id: principalId },
        include: { academy: true },
      });
      expect(prisma.academy.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateAcademyDto,
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const principalId = 999;
      const updateAcademyDto: UpdateAcademyDto = {
        name: 'Updated Academy',
      };

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAcademy(principalId, updateAcademyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionEnrollments', () => {
    it('should get session enrollments successfully', async () => {
      const sessionId = 1;
      const principalId = 1;
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];

      prisma.sessionEnrollment.findMany.mockResolvedValue(enrollments);

      classSessionService.getPrincipalSessionEnrollments.mockResolvedValue(
        enrollments,
      );

      const result = await service.getSessionEnrollments(
        sessionId,
        principalId,
      );

      expect(result).toEqual(enrollments);
      expect(
        classSessionService.getPrincipalSessionEnrollments,
      ).toHaveBeenCalledWith(sessionId, principalId);
    });
  });

  describe('getSessionsWithEnrollmentRequests', () => {
    it('should get sessions with enrollment requests', async () => {
      const principalId = 1;
      const sessions = [{ id: 1, enrollmentRequests: [] }];

      prisma.sessionEnrollment.findMany.mockResolvedValue(sessions);

      classSessionService.getPrincipalSessionsWithEnrollmentRequests.mockResolvedValue(
        sessions,
      );

      const result =
        await service.getSessionsWithEnrollmentRequests(principalId);

      expect(result).toEqual(sessions);
      expect(
        classSessionService.getPrincipalSessionsWithEnrollmentRequests,
      ).toHaveBeenCalledWith(principalId);
    });
  });

  describe('getSessionsWithRefundRequests', () => {
    it('should get sessions with refund requests', async () => {
      const principalId = 1;
      const sessions = [{ id: 1, refundRequests: [] }];

      prisma.refundRequest.findMany.mockResolvedValue(sessions);

      refundService.getPrincipalSessionsWithRefundRequests.mockResolvedValue(
        sessions,
      );

      const result = await service.getSessionsWithRefundRequests(principalId);

      expect(result).toEqual(sessions);
      expect(
        refundService.getPrincipalSessionsWithRefundRequests,
      ).toHaveBeenCalledWith(principalId);
    });
  });
});

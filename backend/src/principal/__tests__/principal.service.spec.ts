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
    $transaction: jest.fn(),
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
      const userRefId = 1;
      const academy = {
        id: 1,
        name: 'Test Academy',
        teachers: [],
        classes: [],
        students: [],
      };
      const principal = { id: 1, userRefId, academy };

      prisma.principal.findUnique.mockResolvedValue(principal);

      const result = await service.getMyAcademy(userRefId);

      expect(result).toEqual(academy);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getMyAcademy(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllSessions', () => {
    it('should get all sessions', async () => {
      const userRefId = 1;
      const principalId = 1;
      const sessions = [{ id: 1, classId: 1, date: new Date() }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      classSessionService.getPrincipalSessions.mockResolvedValue(sessions);

      const result = await service.getAllSessions(userRefId);

      expect(result).toEqual(sessions);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(classSessionService.getPrincipalSessions).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getAllSessions(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllClasses', () => {
    it('should get all classes', async () => {
      const userRefId = 1;
      const principalId = 1;
      const classes = [{ id: 1, className: 'Test Class' }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      classService.getPrincipalClasses.mockResolvedValue(classes);

      const result = await service.getAllClasses(userRefId);

      expect(result).toEqual(classes);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(classService.getPrincipalClasses).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getAllClasses(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllTeachers', () => {
    it('should get all teachers', async () => {
      const userRefId = 1;
      const principalId = 1;
      const teachers = [{ id: 1, name: 'Test Teacher' }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      teacherService.getPrincipalTeachers.mockResolvedValue(teachers);

      const result = await service.getAllTeachers(userRefId);

      expect(result).toEqual(teachers);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(teacherService.getPrincipalTeachers).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getAllTeachers(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllStudents', () => {
    it('should get all students', async () => {
      const userRefId = 1;
      const principalId = 1;
      const students = [{ id: 1, name: 'Test Student' }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      studentService.getPrincipalStudents.mockResolvedValue(students);

      const result = await service.getAllStudents(userRefId);

      expect(result).toEqual(students);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(studentService.getPrincipalStudents).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getAllStudents(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllEnrollments', () => {
    it('should get all enrollments', async () => {
      const userRefId = 1;
      const principalId = 1;
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      classSessionService.getPrincipalEnrollments.mockResolvedValue(
        enrollments,
      );

      const result = await service.getAllEnrollments(userRefId);

      expect(result).toEqual(enrollments);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(classSessionService.getPrincipalEnrollments).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getAllEnrollments(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllRefundRequests', () => {
    it('should get all refund requests', async () => {
      const userRefId = 1;
      const principalId = 1;
      const refundRequests = [{ id: 1, studentId: 1, amount: 50000 }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      refundService.getPrincipalRefundRequests.mockResolvedValue(
        refundRequests,
      );

      const result = await service.getAllRefundRequests(userRefId);

      expect(result).toEqual(refundRequests);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(refundService.getPrincipalRefundRequests).toHaveBeenCalledWith(
        principalId,
      );
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getAllRefundRequests(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPrincipalInfo', () => {
    it('should get principal info successfully', async () => {
      const userRefId = 1;
      const principalInfo = {
        id: 1,
        userRefId,
        name: 'Test Principal',
        email: 'test@example.com',
        phoneNumber: '010-1234-5678',
      };

      prisma.principal.findUnique.mockResolvedValue(principalInfo);

      const result = await service.getPrincipalInfo(userRefId);

      expect(result).toEqual(principalInfo);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
        include: { academy: true },
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getPrincipalInfo(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPrincipalBankInfo', () => {
    it('should get principal bank info successfully', async () => {
      const userRefId = 1;
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

      const result = await service.getPrincipalBankInfo(userRefId);

      expect(result).toEqual(bankInfo);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(service.getPrincipalBankInfo(userRefId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update principal profile successfully', async () => {
      const userRefId = 1;
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Principal',
        phoneNumber: '010-1234-5678',
        introduction: 'Updated introduction',
      };
      const updatedProfile = {
        id: 1,
        userRefId,
        userId: 1,
        name: 'Updated Principal',
        phoneNumber: '010-1234-5678',
        introduction: 'Updated introduction',
        academy: { id: 1, name: 'Test Academy' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.principal.findUnique.mockResolvedValue({ id: 1, userRefId });
      prisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          principal: {
            update: jest.fn().mockResolvedValue(updatedProfile),
          },
          user: {
            update: jest
              .fn()
              .mockResolvedValue({ id: userRefId, name: 'Updated Principal' }),
          },
        };
        return await callback(mockTx);
      });

      const result = await service.updateProfile(userRefId, updateProfileDto);

      expect(result).toEqual(updatedProfile);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateAcademy', () => {
    it('should update academy successfully', async () => {
      const userRefId = 1;
      const updateAcademyDto: UpdateAcademyDto = {
        name: 'Updated Academy',
        phoneNumber: '02-1234-5678',
        address: 'Updated Address',
      };
      const updatedAcademy = { id: 1, ...updateAcademyDto };

      prisma.principal.findUnique.mockResolvedValue({
        id: 1,
        userRefId,
        academyId: 1,
      });
      prisma.academy.update.mockResolvedValue(updatedAcademy);

      const result = await service.updateAcademy(userRefId, updateAcademyDto);

      expect(result).toEqual(updatedAcademy);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
        include: { academy: true },
      });
      expect(prisma.academy.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateAcademyDto,
      });
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;
      const updateAcademyDto: UpdateAcademyDto = {
        name: 'Updated Academy',
      };

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAcademy(userRefId, updateAcademyDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionEnrollments', () => {
    it('should get session enrollments successfully', async () => {
      const sessionId = 1;
      const userRefId = 1;
      const principalId = 1;
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      classSessionService.getPrincipalSessionEnrollments.mockResolvedValue(
        enrollments,
      );

      const result = await service.getSessionEnrollments(sessionId, userRefId);

      expect(result).toEqual(enrollments);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(
        classSessionService.getPrincipalSessionEnrollments,
      ).toHaveBeenCalledWith(sessionId, principalId);
    });

    it('should throw NotFoundException when principal not found', async () => {
      const sessionId = 1;
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(
        service.getSessionEnrollments(sessionId, userRefId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionsWithEnrollmentRequests', () => {
    it('should get sessions with enrollment requests', async () => {
      const userRefId = 1;
      const principalId = 1;
      const sessions = [{ id: 1, enrollmentRequests: [] }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      classSessionService.getPrincipalSessionsWithEnrollmentRequests.mockResolvedValue(
        sessions,
      );

      const result = await service.getSessionsWithEnrollmentRequests(userRefId);

      expect(result).toEqual(sessions);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(
        classSessionService.getPrincipalSessionsWithEnrollmentRequests,
      ).toHaveBeenCalledWith(principalId);
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(
        service.getSessionsWithEnrollmentRequests(userRefId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSessionsWithRefundRequests', () => {
    it('should get sessions with refund requests', async () => {
      const userRefId = 1;
      const principalId = 1;
      const sessions = [{ id: 1, refundRequests: [] }];

      prisma.principal.findUnique.mockResolvedValue({ id: principalId });
      refundService.getPrincipalSessionsWithRefundRequests.mockResolvedValue(
        sessions,
      );

      const result = await service.getSessionsWithRefundRequests(userRefId);

      expect(result).toEqual(sessions);
      expect(prisma.principal.findUnique).toHaveBeenCalledWith({
        where: { userRefId },
      });
      expect(
        refundService.getPrincipalSessionsWithRefundRequests,
      ).toHaveBeenCalledWith(principalId);
    });

    it('should throw NotFoundException when principal not found', async () => {
      const userRefId = 999;

      prisma.principal.findUnique.mockResolvedValue(null);

      await expect(
        service.getSessionsWithRefundRequests(userRefId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PrincipalController } from '../principal.controller';
import { PrincipalService } from '../principal.service';
import { UpdateAcademyDto } from '../dto/update-academy.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

describe('PrincipalController', () => {
  let controller: PrincipalController;
  let service: PrincipalService;

  const mockService = {
    getMyAcademy: jest.fn(),
    getAllSessions: jest.fn(),
    getAllClasses: jest.fn(),
    getAllTeachers: jest.fn(),
    getAllStudents: jest.fn(),
    getAllEnrollments: jest.fn(),
    getAllRefundRequests: jest.fn(),
    getPrincipalInfo: jest.fn(),
    getPrincipalBankInfo: jest.fn(),
    getPrincipalData: jest.fn(),
    updateProfile: jest.fn(),
    updateProfilePhoto: jest.fn(),
    getSessionEnrollments: jest.fn(),
    updateAcademy: jest.fn(),
    getSessionsWithEnrollmentRequests: jest.fn(),
    getSessionsWithRefundRequests: jest.fn(),
    getSessionEnrollmentRequests: jest.fn(),
    getSessionRefundRequests: jest.fn(),
    approveEnrollment: jest.fn(),
    rejectEnrollment: jest.fn(),
    approveRefund: jest.fn(),
    rejectRefund: jest.fn(),
    removeTeacher: jest.fn(),
    removeStudent: jest.fn(),
    getStudentSessionHistory: jest.fn(),
  };

  const mockUser = {
    id: 1,
    userId: 'testprincipal',
    role: 'PRINCIPAL',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrincipalController],
      providers: [{ provide: PrincipalService, useValue: mockService }],
    }).compile();
    controller = module.get<PrincipalController>(PrincipalController);
    service = module.get<PrincipalService>(PrincipalService);
    jest.clearAllMocks();
  });

  describe('getMyAcademy', () => {
    it('should get principal academy', async () => {
      const academy = { id: 1, name: 'Test Academy' };
      mockService.getMyAcademy.mockResolvedValue(academy);

      const result = await controller.getMyAcademy(mockUser);

      expect(result).toEqual(academy);
      expect(service.getMyAcademy).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAllSessions', () => {
    it('should get all sessions', async () => {
      const sessions = [{ id: 1, classId: 1, date: new Date() }];
      mockService.getAllSessions.mockResolvedValue(sessions);

      const result = await controller.getAllSessions(mockUser);

      expect(result).toEqual(sessions);
      expect(service.getAllSessions).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAllClasses', () => {
    it('should get all classes', async () => {
      const classes = [{ id: 1, className: 'Test Class' }];
      mockService.getAllClasses.mockResolvedValue(classes);

      const result = await controller.getAllClasses(mockUser);

      expect(result).toEqual(classes);
      expect(service.getAllClasses).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAllTeachers', () => {
    it('should get all teachers', async () => {
      const teachers = [{ id: 1, name: 'Test Teacher' }];
      mockService.getAllTeachers.mockResolvedValue(teachers);

      const result = await controller.getAllTeachers(mockUser);

      expect(result).toEqual(teachers);
      expect(service.getAllTeachers).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAllStudents', () => {
    it('should get all students', async () => {
      const students = [{ id: 1, name: 'Test Student' }];
      mockService.getAllStudents.mockResolvedValue(students);

      const result = await controller.getAllStudents(mockUser);

      expect(result).toEqual(students);
      expect(service.getAllStudents).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAllEnrollments', () => {
    it('should get all enrollments', async () => {
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];
      mockService.getAllEnrollments.mockResolvedValue(enrollments);

      const result = await controller.getAllEnrollments(mockUser);

      expect(result).toEqual(enrollments);
      expect(service.getAllEnrollments).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getAllRefundRequests', () => {
    it('should get all refund requests', async () => {
      const refundRequests = [{ id: 1, studentId: 1, amount: 50000 }];
      mockService.getAllRefundRequests.mockResolvedValue(refundRequests);

      const result = await controller.getAllRefundRequests(mockUser);

      expect(result).toEqual(refundRequests);
      expect(service.getAllRefundRequests).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getPrincipalInfo', () => {
    it('should get principal info', async () => {
      const principalInfo = { id: 1, name: 'Test Principal' };
      mockService.getPrincipalInfo.mockResolvedValue(principalInfo);

      const result = await controller.getPrincipalInfo(mockUser);

      expect(result).toEqual(principalInfo);
      expect(service.getPrincipalInfo).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getPrincipalBankInfo', () => {
    it('should get principal bank info', async () => {
      const bankInfo = { bankName: 'Test Bank', accountNumber: '123-456-789' };
      mockService.getPrincipalBankInfo.mockResolvedValue(bankInfo);

      const result = await controller.getPrincipalBankInfo(mockUser);

      expect(result).toEqual(bankInfo);
      expect(service.getPrincipalBankInfo).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getPrincipalData', () => {
    it('should get principal data', async () => {
      const principalData = {
        academy: { id: 1, name: 'Test Academy' },
        teachers: [],
        students: [],
        classes: [],
      };
      mockService.getPrincipalData.mockResolvedValue(principalData);

      const result = await controller.getPrincipalData(mockUser);

      expect(result).toEqual(principalData);
      expect(service.getPrincipalData).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('updateProfile', () => {
    it('should update principal profile', async () => {
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Principal',
        phoneNumber: '010-1234-5678',
        introduction: 'Updated introduction',
      };
      const updatedProfile = { id: 1, ...updateProfileDto };
      mockService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(mockUser, updateProfileDto);

      expect(result).toEqual(updatedProfile);
      expect(service.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        updateProfileDto,
      );
    });
  });

  describe('updateProfilePhoto', () => {
    it('should update principal profile photo', async () => {
      const mockFile = {
        fieldname: 'photo',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;
      const result = { message: 'Profile photo updated successfully' };
      mockService.updateProfilePhoto.mockResolvedValue(result);

      const response = await controller.updateProfilePhoto(mockUser, mockFile);

      expect(response).toEqual(result);
      expect(service.updateProfilePhoto).toHaveBeenCalledWith(
        mockUser.id,
        mockFile,
      );
    });
  });

  describe('getSessionEnrollments', () => {
    it('should get session enrollments', async () => {
      const sessionId = 1;
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];
      mockService.getSessionEnrollments.mockResolvedValue(enrollments);

      const result = await controller.getSessionEnrollments(
        sessionId,
        mockUser,
      );

      expect(result).toEqual(enrollments);
      expect(service.getSessionEnrollments).toHaveBeenCalledWith(
        sessionId,
        mockUser.id,
      );
    });
  });

  describe('updateAcademy', () => {
    it('should update academy', async () => {
      const updateAcademyDto: UpdateAcademyDto = {
        name: 'Updated Academy',
        phoneNumber: '02-1234-5678',
        address: 'Updated Address',
      };
      const updatedAcademy = { id: 1, ...updateAcademyDto };
      mockService.updateAcademy.mockResolvedValue(updatedAcademy);

      const result = await controller.updateAcademy(mockUser, updateAcademyDto);

      expect(result).toEqual(updatedAcademy);
      expect(service.updateAcademy).toHaveBeenCalledWith(
        mockUser.id,
        updateAcademyDto,
      );
    });
  });

  describe('getSessionsWithEnrollmentRequests', () => {
    it('should get sessions with enrollment requests', async () => {
      const sessions = [{ id: 1, enrollmentRequests: [] }];
      mockService.getSessionsWithEnrollmentRequests.mockResolvedValue(sessions);

      const result =
        await controller.getSessionsWithEnrollmentRequests(mockUser);

      expect(result).toEqual(sessions);
      expect(service.getSessionsWithEnrollmentRequests).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('getSessionsWithRefundRequests', () => {
    it('should get sessions with refund requests', async () => {
      const sessions = [{ id: 1, refundRequests: [] }];
      mockService.getSessionsWithRefundRequests.mockResolvedValue(sessions);

      const result = await controller.getSessionsWithRefundRequests(mockUser);

      expect(result).toEqual(sessions);
      expect(service.getSessionsWithRefundRequests).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('getSessionEnrollmentRequests', () => {
    it('should get session enrollment requests', async () => {
      const sessionId = 1;
      const requests = [{ id: 1, studentId: 1, status: 'PENDING' }];
      mockService.getSessionEnrollmentRequests.mockResolvedValue(requests);

      const result = await controller.getSessionEnrollmentRequests(
        sessionId,
        mockUser,
      );

      expect(result).toEqual(requests);
      expect(service.getSessionEnrollmentRequests).toHaveBeenCalledWith(
        sessionId,
        mockUser.id,
      );
    });
  });

  describe('getSessionRefundRequests', () => {
    it('should get session refund requests', async () => {
      const sessionId = 1;
      const requests = [{ id: 1, studentId: 1, amount: 50000 }];
      mockService.getSessionRefundRequests.mockResolvedValue(requests);

      const result = await controller.getSessionRefundRequests(
        sessionId,
        mockUser,
      );

      expect(result).toEqual(requests);
      expect(service.getSessionRefundRequests).toHaveBeenCalledWith(
        sessionId,
        mockUser.id,
      );
    });
  });

  describe('approveEnrollment', () => {
    it('should approve enrollment', async () => {
      const enrollmentId = 1;
      const result = { message: 'Enrollment approved successfully' };
      mockService.approveEnrollment.mockResolvedValue(result);

      const response = await controller.approveEnrollment(
        enrollmentId,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.approveEnrollment).toHaveBeenCalledWith(
        enrollmentId,
        mockUser.id,
      );
    });
  });

  describe('rejectEnrollment', () => {
    it('should reject enrollment', async () => {
      const enrollmentId = 1;
      const rejectData = {
        reason: 'Schedule conflict',
        detailedReason: 'Time overlap',
      };
      const result = { message: 'Enrollment rejected successfully' };
      mockService.rejectEnrollment.mockResolvedValue(result);

      const response = await controller.rejectEnrollment(
        enrollmentId,
        rejectData,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.rejectEnrollment).toHaveBeenCalledWith(
        enrollmentId,
        rejectData,
        mockUser.id,
      );
    });
  });

  describe('approveRefund', () => {
    it('should approve refund', async () => {
      const refundId = 1;
      const result = { message: 'Refund approved successfully' };
      mockService.approveRefund.mockResolvedValue(result);

      const response = await controller.approveRefund(refundId, mockUser);

      expect(response).toEqual(result);
      expect(service.approveRefund).toHaveBeenCalledWith(refundId, mockUser.id);
    });
  });

  describe('rejectRefund', () => {
    it('should reject refund', async () => {
      const refundId = 1;
      const rejectData = {
        reason: 'Class already attended',
        detailedReason: 'No valid reason',
      };
      const result = { message: 'Refund rejected successfully' };
      mockService.rejectRefund.mockResolvedValue(result);

      const response = await controller.rejectRefund(
        refundId,
        rejectData,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.rejectRefund).toHaveBeenCalledWith(
        refundId,
        rejectData,
        mockUser.id,
      );
    });
  });

  describe('removeTeacher', () => {
    it('should remove teacher', async () => {
      const teacherId = 1;
      const result = { message: 'Teacher removed successfully' };
      mockService.removeTeacher.mockResolvedValue(result);

      const response = await controller.removeTeacher(teacherId, mockUser);

      expect(response).toEqual(result);
      expect(service.removeTeacher).toHaveBeenCalledWith(
        teacherId,
        mockUser.id,
      );
    });
  });

  describe('removeStudent', () => {
    it('should remove student', async () => {
      const studentId = 1;
      const result = { message: 'Student removed successfully' };
      mockService.removeStudent.mockResolvedValue(result);

      const response = await controller.removeStudent(studentId, mockUser);

      expect(response).toEqual(result);
      expect(service.removeStudent).toHaveBeenCalledWith(
        studentId,
        mockUser.id,
      );
    });
  });

  describe('getStudentSessionHistory', () => {
    it('should get student session history', async () => {
      const studentId = 1;
      const history = [{ id: 1, sessionId: 1, status: 'COMPLETED' }];
      mockService.getStudentSessionHistory.mockResolvedValue(history);

      const result = await controller.getStudentSessionHistory(
        studentId,
        mockUser,
      );

      expect(result).toEqual(history);
      expect(service.getStudentSessionHistory).toHaveBeenCalledWith(
        studentId,
        mockUser.id,
      );
    });
  });
});

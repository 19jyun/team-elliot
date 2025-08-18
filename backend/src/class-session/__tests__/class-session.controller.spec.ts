import { Test, TestingModule } from '@nestjs/testing';
import { ClassSessionController } from '../class-session.controller';
import { ClassSessionService } from '../class-session.service';
import {
  UpdateEnrollmentStatusDto,
  SessionEnrollmentStatus,
} from '../dto/update-enrollment-status.dto';
import { ChangeEnrollmentDto } from '../dto/change-enrollment.dto';

describe('ClassSessionController', () => {
  let controller: ClassSessionController;
  let service: ClassSessionService;

  const mockService = {
    createClassSession: jest.fn(),
    updateClassSession: jest.fn(),
    deleteClassSession: jest.fn(),
    getTeacherEnrollments: jest.fn(),
    updateEnrollmentStatus: jest.fn(),
    batchUpdateEnrollmentStatus: jest.fn(),
    checkAttendance: jest.fn(),
    getSessionEnrollments: jest.fn(),
    completeSessions: jest.fn(),
    enrollSession: jest.fn(),
    batchEnrollSessions: jest.fn(),
    cancelEnrollment: jest.fn(),
    getStudentEnrollments: jest.fn(),
    getClassSessions: jest.fn(),
    getClassSessionsForModification: jest.fn(),
    getClassSessionsForEnrollment: jest.fn(),
    getStudentAvailableSessionsForEnrollment: jest.fn(),
    changeEnrollment: jest.fn(),
    getStudentClassEnrollments: jest.fn(),
    batchModifyEnrollments: jest.fn(),
    findStudentByUserId: jest.fn(),
  };

  const mockUser = {
    id: 1,
    userId: 'testuser',
    role: 'TEACHER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassSessionController],
      providers: [{ provide: ClassSessionService, useValue: mockService }],
    }).compile();
    controller = module.get<ClassSessionController>(ClassSessionController);
    service = module.get<ClassSessionService>(ClassSessionService);
    jest.clearAllMocks();
  });

  describe('createClassSession', () => {
    it('should create a class session', async () => {
      const sessionData = {
        classId: 1,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00'),
        endTime: new Date('2024-01-15T15:00:00'),
      };
      const createdSession = { id: 1, ...sessionData };
      mockService.createClassSession.mockResolvedValue(createdSession);

      const result = await controller.createClassSession(sessionData, mockUser);

      expect(result).toEqual(createdSession);
      expect(service.createClassSession).toHaveBeenCalledWith(
        sessionData,
        mockUser.id,
      );
    });
  });

  describe('updateClassSession', () => {
    it('should update a class session', async () => {
      const sessionId = 1;
      const updateData = {
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T14:00:00'),
        endTime: new Date('2024-01-16T15:00:00'),
      };
      const updatedSession = { id: sessionId, ...updateData };
      mockService.updateClassSession.mockResolvedValue(updatedSession);

      const result = await controller.updateClassSession(
        sessionId,
        updateData,
        mockUser,
      );

      expect(result).toEqual(updatedSession);
      expect(service.updateClassSession).toHaveBeenCalledWith(
        sessionId,
        updateData,
        mockUser.id,
      );
    });
  });

  describe('deleteClassSession', () => {
    it('should delete a class session', async () => {
      const sessionId = 1;
      const result = { message: 'Session deleted successfully' };
      mockService.deleteClassSession.mockResolvedValue(result);

      const response = await controller.deleteClassSession(sessionId, mockUser);

      expect(response).toEqual(result);
      expect(service.deleteClassSession).toHaveBeenCalledWith(
        sessionId,
        mockUser.id,
      );
    });
  });

  describe('getTeacherEnrollments', () => {
    it('should get teacher enrollments without filters', async () => {
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];
      mockService.getTeacherEnrollments.mockResolvedValue(enrollments);

      const result = await controller.getTeacherEnrollments(mockUser);

      expect(result).toEqual(enrollments);
      expect(service.getTeacherEnrollments).toHaveBeenCalledWith(
        mockUser.id,
        {},
      );
    });

    it('should get teacher enrollments with filters', async () => {
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];
      const filters = {
        status: SessionEnrollmentStatus.CONFIRMED,
        classId: '1',
        sessionId: '1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockService.getTeacherEnrollments.mockResolvedValue(enrollments);

      const result = await controller.getTeacherEnrollments(
        mockUser,
        filters.status,
        filters.classId,
        filters.sessionId,
        filters.startDate,
        filters.endDate,
      );

      expect(result).toEqual(enrollments);
      expect(service.getTeacherEnrollments).toHaveBeenCalledWith(mockUser.id, {
        status: SessionEnrollmentStatus.CONFIRMED,
        classId: 1,
        sessionId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });
    });
  });

  describe('updateEnrollmentStatus', () => {
    it('should update enrollment status', async () => {
      const enrollmentId = 1;
      const updateDto: UpdateEnrollmentStatusDto = {
        status: SessionEnrollmentStatus.CONFIRMED,
        reason: 'Payment confirmed',
      };
      const result = { message: 'Enrollment status updated' };
      mockService.updateEnrollmentStatus.mockResolvedValue(result);

      const response = await controller.updateEnrollmentStatus(
        enrollmentId,
        updateDto,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.updateEnrollmentStatus).toHaveBeenCalledWith(
        enrollmentId,
        updateDto,
        mockUser.id,
      );
    });
  });

  describe('batchUpdateEnrollmentStatus', () => {
    it('should batch update enrollment status', async () => {
      const batchDto = {
        enrollmentIds: [1, 2, 3],
        status: SessionEnrollmentStatus.CONFIRMED,
        reason: 'Batch confirmation',
      };
      const result = { message: 'Batch update completed' };
      mockService.batchUpdateEnrollmentStatus.mockResolvedValue(result);

      const response = await controller.batchUpdateEnrollmentStatus(
        batchDto,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.batchUpdateEnrollmentStatus).toHaveBeenCalledWith(
        batchDto,
        mockUser.id,
      );
    });
  });

  describe('checkAttendance', () => {
    it('should check attendance as attended', async () => {
      const enrollmentId = 1;
      const attendanceStatus = 'ATTENDED';
      const result = { message: 'Attendance recorded' };
      mockService.checkAttendance.mockResolvedValue(result);

      const response = await controller.checkAttendance(
        enrollmentId,
        attendanceStatus,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.checkAttendance).toHaveBeenCalledWith(
        enrollmentId,
        attendanceStatus,
        mockUser.id,
      );
    });

    it('should check attendance as absent', async () => {
      const enrollmentId = 1;
      const attendanceStatus = 'ABSENT';
      const result = { message: 'Absence recorded' };
      mockService.checkAttendance.mockResolvedValue(result);

      const response = await controller.checkAttendance(
        enrollmentId,
        attendanceStatus,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.checkAttendance).toHaveBeenCalledWith(
        enrollmentId,
        attendanceStatus,
        mockUser.id,
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

  describe('enrollSession', () => {
    it('should enroll in a session', async () => {
      const sessionId = 1;
      const result = { message: 'Enrolled successfully' };
      const mockStudent = { id: 1, userId: 'testuser' };

      mockService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockService.enrollSession.mockResolvedValue(result);

      const response = await controller.enrollSession(sessionId, mockUser);

      expect(response).toEqual(result);
      expect(service.findStudentByUserId).toHaveBeenCalledWith(mockUser.userId);
      expect(service.enrollSession).toHaveBeenCalledWith(
        sessionId,
        mockStudent.id,
      );
    });
  });

  describe('batchEnrollSessions', () => {
    it('should batch enroll in sessions', async () => {
      const data = { sessionIds: [1, 2, 3] };
      const result = { message: 'Batch enrollment completed' };
      const mockStudent = { id: 1, userId: 'testuser' };

      mockService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockService.batchEnrollSessions.mockResolvedValue(result);

      const response = await controller.batchEnrollSessions(data, mockUser);

      expect(response).toEqual(result);
      expect(service.findStudentByUserId).toHaveBeenCalledWith(mockUser.userId);
      expect(service.batchEnrollSessions).toHaveBeenCalledWith(
        [1, 2, 3],
        mockStudent.id,
      );
    });
  });

  describe('cancelEnrollment', () => {
    it('should cancel enrollment', async () => {
      const enrollmentId = 1;
      const result = { message: 'Enrollment cancelled' };
      const mockStudent = { id: 1, userId: 'testuser' };

      mockService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockService.cancelEnrollment.mockResolvedValue(result);

      const response = await controller.cancelEnrollment(
        enrollmentId,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.findStudentByUserId).toHaveBeenCalledWith(mockUser.userId);
      expect(service.cancelEnrollment).toHaveBeenCalledWith(
        enrollmentId,
        mockStudent.id,
      );
    });
  });

  describe('getStudentEnrollments', () => {
    it('should get student enrollments', async () => {
      const enrollments = [{ id: 1, studentId: 1, sessionId: 1 }];
      const mockStudent = { id: 1, userId: 'testuser' };

      mockService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockService.getStudentEnrollments.mockResolvedValue(enrollments);

      const result = await controller.getStudentEnrollments(mockUser);

      expect(result).toEqual(enrollments);
      expect(service.findStudentByUserId).toHaveBeenCalledWith(mockUser.userId);
      expect(service.getStudentEnrollments).toHaveBeenCalledWith(
        mockStudent.id,
        {},
      );
    });
  });

  describe('getClassSessions', () => {
    it('should get class sessions', async () => {
      const classId = 1;
      const sessions = [{ id: 1, classId: 1, date: new Date() }];
      mockService.getClassSessions.mockResolvedValue(sessions);

      const result = await controller.getClassSessions(classId, mockUser);

      expect(result).toEqual(sessions);
      expect(service.getClassSessions).toHaveBeenCalledWith(classId, undefined);
    });
  });

  describe('changeEnrollment', () => {
    it('should change enrollment', async () => {
      const enrollmentId = 1;
      const changeDto: ChangeEnrollmentDto = {
        newSessionId: 2,
        reason: 'Schedule conflict',
      };
      const result = { message: 'Enrollment changed' };
      mockService.changeEnrollment.mockResolvedValue(result);

      const response = await controller.changeEnrollment(
        enrollmentId,
        changeDto,
        mockUser,
      );

      expect(response).toEqual(result);
      expect(service.changeEnrollment).toHaveBeenCalledWith(
        enrollmentId,
        changeDto,
        mockUser.id,
      );
    });
  });

  describe('batchModifyEnrollments', () => {
    it('should batch modify enrollments', async () => {
      const data = {
        cancellations: [1, 2],
        newEnrollments: [3, 4],
        reason: 'Schedule adjustment',
      };
      const result = { message: 'Batch modification completed' };
      mockService.batchModifyEnrollments.mockResolvedValue(result);

      const response = await controller.batchModifyEnrollments(data, mockUser);

      expect(response).toEqual(result);
      expect(service.batchModifyEnrollments).toHaveBeenCalledWith(
        data,
        mockUser.id,
      );
    });
  });
});

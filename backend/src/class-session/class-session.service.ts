import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import {
  UpdateEnrollmentStatusDto,
  BatchUpdateEnrollmentStatusDto,
  SessionEnrollmentStatus,
} from './dto/update-enrollment-status.dto';
import { ChangeEnrollmentDto } from './dto/change-enrollment.dto';
import {
  ACTIVITY_TYPES,
  ENTITY_TYPES,
} from '../activity-log/constants/activity-types';

@Injectable()
export class ClassSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  /**
   * 클래스 세션 생성
   */
  async createClassSession(
    data: {
      classId: number;
      date: Date;
      startTime: Date;
      endTime: Date;
    },
    teacherId: number,
  ) {
    // 클래스 정보 조회
    const classInfo = await this.prisma.class.findUnique({
      where: { id: data.classId },
      include: { teacher: true },
    });

    if (!classInfo) {
      throw new NotFoundException('클래스를 찾을 수 없습니다.');
    }

    // 권한 확인
    if (classInfo.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 클래스의 세션을 생성할 권한이 없습니다.',
      );
    }

    // 세션 생성 (클래스의 maxStudents를 세션의 maxStudents로 복사)
    const session = await this.prisma.classSession.create({
      data: {
        ...data,
        maxStudents: classInfo.maxStudents,
        currentStudents: 0,
      },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    // 세션 생성 로그
    await this.activityLogService.logActivityAsync({
      userId: teacherId,
      userRole: 'TEACHER',
      action: ACTIVITY_TYPES.CLASS.CLASS_SESSION_CREATE,
      entityType: ENTITY_TYPES.CLASS_SESSION,
      entityId: session.id,
      newValue: {
        sessionId: session.id,
        classId: session.classId,
        className: session.class.className,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      description: `${session.class.className} 세션 생성: ${session.date.toLocaleDateString()}`,
    });

    return session;
  }

  /**
   * 클래스 세션 수정
   */
  async updateClassSession(
    sessionId: number,
    data: {
      date?: Date;
      startTime?: Date;
      endTime?: Date;
    },
    teacherId: number,
  ) {
    // 세션 정보 조회
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    // 권한 확인
    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException('해당 세션을 수정할 권한이 없습니다.');
    }

    const oldData = {
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
    };

    // 세션 수정
    const updatedSession = await this.prisma.classSession.update({
      where: { id: sessionId },
      data,
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    // 세션 수정 로그
    await this.activityLogService.logActivityAsync({
      userId: teacherId,
      userRole: 'TEACHER',
      action: ACTIVITY_TYPES.CLASS.CLASS_SESSION_UPDATE,
      entityType: ENTITY_TYPES.CLASS_SESSION,
      entityId: sessionId,
      oldValue: oldData,
      newValue: {
        sessionId,
        classId: session.classId,
        className: session.class.className,
        date: updatedSession.date,
        startTime: updatedSession.startTime,
        endTime: updatedSession.endTime,
      },
      description: `${session.class.className} 세션 수정: ${updatedSession.date.toLocaleDateString()}`,
    });

    return updatedSession;
  }

  /**
   * 클래스 세션 삭제
   */
  async deleteClassSession(sessionId: number, teacherId: number) {
    // 세션 정보 조회
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    // 권한 확인
    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException('해당 세션을 삭제할 권한이 없습니다.');
    }

    // 수강 신청이 있는 경우 삭제 불가
    if (session.enrollments.length > 0) {
      throw new BadRequestException(
        '수강 신청이 있는 세션은 삭제할 수 없습니다.',
      );
    }

    // 세션 삭제
    await this.prisma.classSession.delete({
      where: { id: sessionId },
    });

    // 세션 삭제 로그
    await this.activityLogService.logActivityAsync({
      userId: teacherId,
      userRole: 'TEACHER',
      action: ACTIVITY_TYPES.CLASS.CLASS_SESSION_DELETE,
      entityType: ENTITY_TYPES.CLASS_SESSION,
      entityId: sessionId,
      oldValue: {
        sessionId,
        classId: session.classId,
        className: session.class.className,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      description: `${session.class.className} 세션 삭제: ${session.date.toLocaleDateString()}`,
    });

    return { message: '세션이 삭제되었습니다.' };
  }

  async getClassSessions(classId: number, studentId?: number) {
    console.log('=== getClassSessions 호출됨 ===');
    console.log('classId:', classId, 'studentId:', studentId);

    const sessions = await this.prisma.classSession.findMany({
      where: { classId },
      include: {
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        enrollments: {
          where: studentId ? { studentId } : undefined,
          include: {
            student: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    console.log('조회된 세션 수:', sessions.length);

    // 각 세션에 isEnrollable 정보 추가
    const sessionsWithEnrollableInfo = sessions.map((session) => {
      const now = new Date();

      // session.date와 session.startTime을 조합해서 정확한 날짜시간 생성
      const sessionDate = new Date(session.date);
      const sessionStartTimeStr = session.startTime.toTimeString().slice(0, 5); // "HH:MM" 형식
      const [hours, minutes] = sessionStartTimeStr.split(':').map(Number);

      const sessionStartTime = new Date(sessionDate);
      sessionStartTime.setHours(hours, minutes, 0, 0);

      // 수강 가능 여부 판단
      const isFull = session.currentStudents >= session.class.maxStudents;
      const isPastStartTime = now >= sessionStartTime;
      const isAlreadyEnrolled = session.enrollments.some(
        (enrollment) =>
          enrollment.status === 'CONFIRMED' || enrollment.status === 'PENDING',
      );
      const isEnrollable = !isPastStartTime && !isFull && !isAlreadyEnrolled;

      return {
        ...session,
        class: {
          ...session.class,
          tuitionFee: session.class.tuitionFee.toString(), // tuitionFee를 문자열로 포함
        },
        isEnrollable,
        isFull,
        isPastStartTime,
        isAlreadyEnrolled,
      };
    });

    return sessionsWithEnrollableInfo;
  }

  async getClassSession(id: number) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    return session;
  }

  async enrollSession(sessionId: number, studentId: number) {
    // 세션이 존재하는지 확인
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: true,
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    // 이미 수강 신청했는지 확인
    const existingEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('이미 수강 신청한 세션입니다.');
    }

    // 수강 인원 초과 체크
    if (session.currentStudents >= session.class.maxStudents) {
      throw new BadRequestException('수강 인원이 초과되었습니다.');
    }

    // 이미 시작된 수업인지 체크
    const now = new Date();
    const sessionStartTime = new Date(session.startTime);
    if (now >= sessionStartTime) {
      throw new BadRequestException('이미 시작된 수업은 신청할 수 없습니다.');
    }

    // SessionEnrollment 생성
    const enrollment = await this.prisma.sessionEnrollment.create({
      data: {
        studentId,
        sessionId,
        status: 'PENDING',
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    // 활동 로그 기록 (비동기)
    this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.ENROLLMENT.ENROLL_SESSION,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: enrollment.id,
      newValue: {
        sessionId,
        status: 'PENDING',
        className: session.class.className,
        sessionDate: session.date,
      },
      description: `수강 신청: ${session.class.className} - ${session.date.toLocaleDateString()}`,
    });

    return enrollment;
  }

  async batchEnrollSessions(sessionIds: number[], studentId: number) {
    const enrollments = [];
    const failedSessions = [];

    for (const sessionId of sessionIds) {
      try {
        const enrollment = await this.enrollSession(sessionId, studentId);
        enrollments.push(enrollment);
      } catch (error) {
        console.error(`Failed to enroll session ${sessionId}:`, error.message);
        failedSessions.push({ sessionId, error: error.message });
      }
    }

    // 배치 수강 신청 활동 로그
    this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.ENROLLMENT.BATCH_ENROLL_SESSIONS,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      newValue: {
        sessionIds,
        successCount: enrollments.length,
        totalCount: sessionIds.length,
      },
      description: `배치 수강 신청: ${enrollments.length}/${sessionIds.length}개 세션 신청 완료`,
    });

    return {
      success: enrollments.length,
      total: sessionIds.length,
      enrollments,
      failedSessions,
    };
  }

  /**
   * 수강 신청 상태 업데이트 (선생님/관리자용)
   */
  async updateEnrollmentStatus(
    enrollmentId: number,
    updateDto: UpdateEnrollmentStatusDto,
    teacherId: number,
  ) {
    // 수강 신청 정보 조회
    const enrollment = await this.prisma.sessionEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('수강 신청을 찾을 수 없습니다.');
    }

    // 권한 확인 (선생님은 자신의 클래스만, 관리자는 모든 클래스)
    if (enrollment.session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 클래스의 수강 신청을 관리할 권한이 없습니다.',
      );
    }

    const oldStatus = enrollment.status;
    const newStatus = updateDto.status;

    // 상태 변경 로직
    let updateData: any = { status: newStatus };

    if (newStatus === SessionEnrollmentStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    // 수강 신청 상태 업데이트
    const updatedEnrollment = await this.prisma.sessionEnrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    // 세션의 currentStudents 업데이트
    await this.updateSessionCurrentStudents(
      enrollment.sessionId,
      oldStatus,
      newStatus,
    );

    // 활동 로그 기록
    const action = this.getActionForStatusChange(oldStatus, newStatus);
    await this.activityLogService.logActivityAsync({
      userId: teacherId,
      userRole: 'TEACHER',
      action,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: enrollmentId,
      oldValue: {
        status: oldStatus,
        studentId: enrollment.studentId,
        sessionId: enrollment.sessionId,
      },
      newValue: {
        status: newStatus,
        studentId: enrollment.studentId,
        sessionId: enrollment.sessionId,
        reason: updateDto.reason,
      },
      description: `${enrollment.student.name}님의 수강 신청 ${this.getStatusChangeDescription(oldStatus, newStatus)}`,
    });

    return updatedEnrollment;
  }

  /**
   * 배치 수강 신청 상태 업데이트
   */
  async batchUpdateEnrollmentStatus(
    batchDto: BatchUpdateEnrollmentStatusDto,
    teacherId: number,
  ) {
    const { enrollmentIds, status, reason } = batchDto;

    // 모든 수강 신청이 같은 선생님의 클래스인지 확인
    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        id: { in: enrollmentIds },
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
    });

    if (enrollments.length !== enrollmentIds.length) {
      throw new NotFoundException('일부 수강 신청을 찾을 수 없습니다.');
    }

    // 권한 확인
    const unauthorizedEnrollments = enrollments.filter(
      (enrollment) => enrollment.session.class.teacherId !== teacherId,
    );

    if (unauthorizedEnrollments.length > 0) {
      throw new ForbiddenException(
        '일부 수강 신청에 대한 관리 권한이 없습니다.',
      );
    }

    // 배치 업데이트
    const updateData: any = { status };
    if (status === SessionEnrollmentStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    const updatedEnrollments = await this.prisma.sessionEnrollment.updateMany({
      where: {
        id: { in: enrollmentIds },
      },
      data: updateData,
    });

    // 배치 활동 로그
    await this.activityLogService.logActivityAsync({
      userId: teacherId,
      userRole: 'TEACHER',
      action: this.getBatchActionForStatusChange(status),
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      newValue: {
        enrollmentIds,
        status,
        reason,
        count: enrollmentIds.length,
      },
      description: `${enrollmentIds.length}개 수강 신청 ${this.getStatusChangeDescription('PENDING', status)}`,
    });

    return {
      success: updatedEnrollments.count,
      total: enrollmentIds.length,
    };
  }

  /**
   * 선생님의 수강 신청 목록 조회
   */
  async getTeacherEnrollments(
    teacherId: number,
    filters: {
      status?: SessionEnrollmentStatus;
      classId?: number;
      sessionId?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.prisma.sessionEnrollment.findMany({
      where: {
        session: {
          class: {
            teacherId,
          },
        },
        ...(filters.status && { status: filters.status }),
        ...(filters.classId && { session: { classId: filters.classId } }),
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.startDate &&
          filters.endDate && {
            session: {
              date: {
                gte: filters.startDate,
                lte: filters.endDate,
              },
            },
          }),
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
      orderBy: [{ session: { date: 'asc' } }, { enrolledAt: 'desc' }],
    });
  }

  /**
   * 수업 종료 후 자동 상태 업데이트 (스케줄러용)
   */
  async updateCompletedSessions() {
    const now = new Date();

    // 종료된 세션의 수강 신청들을 COMPLETED로 변경
    const completedEnrollments = await this.prisma.sessionEnrollment.updateMany(
      {
        where: {
          status: {
            in: [
              SessionEnrollmentStatus.CONFIRMED,
              SessionEnrollmentStatus.ATTENDED,
            ],
          },
          session: {
            endTime: { lt: now },
          },
        },
        data: {
          status: SessionEnrollmentStatus.COMPLETED,
        },
      },
    );

    // 배치 완료 로그
    if (completedEnrollments.count > 0) {
      await this.activityLogService.logActivityAsync({
        userId: 1, // 시스템 사용자 ID (관리자)
        userRole: 'ADMIN',
        action: ACTIVITY_TYPES.ADMIN.BATCH_SESSION_COMPLETE,
        entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
        newValue: {
          completedCount: completedEnrollments.count,
          completedAt: now,
        },
        description: `${completedEnrollments.count}개의 수강 신청이 자동으로 완료 상태로 변경되었습니다.`,
      });
    }

    return {
      updatedCount: completedEnrollments.count,
      message: `${completedEnrollments.count}개의 수강 신청이 완료 상태로 변경되었습니다.`,
    };
  }

  /**
   * 출석 체크 (수업 당일)
   */
  async checkAttendance(
    enrollmentId: number,
    attendanceStatus: 'ATTENDED' | 'ABSENT',
    teacherId: number,
  ) {
    const enrollment = await this.prisma.sessionEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('수강 신청을 찾을 수 없습니다.');
    }

    // 권한 확인
    if (enrollment.session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 클래스의 출석을 관리할 권한이 없습니다.',
      );
    }

    // 수업 당일인지 확인
    const today = new Date();
    const sessionDate = new Date(enrollment.session.date);
    const isSameDay = today.toDateString() === sessionDate.toDateString();

    if (!isSameDay) {
      throw new BadRequestException('출석 체크는 수업 당일에만 가능합니다.');
    }

    const oldStatus = enrollment.status;
    const newStatus = attendanceStatus;

    // 출석 상태 업데이트
    const updatedEnrollment = await this.prisma.sessionEnrollment.update({
      where: { id: enrollmentId },
      data: { status: newStatus },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    // 출석 체크 로그
    await this.activityLogService.logActivityAsync({
      userId: teacherId,
      userRole: 'TEACHER',
      action:
        attendanceStatus === 'ATTENDED'
          ? ACTIVITY_TYPES.ATTENDANCE.ATTENDANCE_CHECK
          : ACTIVITY_TYPES.ATTENDANCE.ABSENT_ATTENDANCE,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: enrollmentId,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      description: `${enrollment.student.name}님 출석 체크: ${attendanceStatus === 'ATTENDED' ? '출석' : '결석'}`,
    });

    return updatedEnrollment;
  }

  /**
   * 학생 수강 취소
   */
  async cancelEnrollment(enrollmentId: number, studentId: number) {
    // 수강 신청 정보 조회
    const enrollment = await this.prisma.sessionEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('수강 신청을 찾을 수 없습니다.');
    }

    // 권한 확인 (자신의 수강 신청만 취소 가능)
    if (enrollment.studentId !== studentId) {
      throw new ForbiddenException('자신의 수강 신청만 취소할 수 있습니다.');
    }

    // 이미 취소된 경우
    if (enrollment.status === SessionEnrollmentStatus.CANCELLED) {
      throw new BadRequestException('이미 취소된 수강 신청입니다.');
    }

    // 수업이 이미 시작된 경우 취소 불가
    const now = new Date();
    const sessionStartTime = new Date(enrollment.session.startTime);
    if (now >= sessionStartTime) {
      throw new BadRequestException('수업이 이미 시작되어 취소할 수 없습니다.');
    }

    const oldStatus = enrollment.status;

    // 수강 신청 취소
    const cancelledEnrollment = await this.prisma.sessionEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: SessionEnrollmentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    // CONFIRMED 상태에서 취소할 때 currentStudents 감소
    if (oldStatus === SessionEnrollmentStatus.CONFIRMED) {
      await this.decrementSessionCurrentStudents(enrollment.sessionId);
    }

    // 수강 취소 로그
    await this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.ENROLLMENT.CANCEL_ENROLLMENT,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: enrollmentId,
      oldValue: {
        status: oldStatus,
        sessionId: enrollment.sessionId,
        className: enrollment.session.class.className,
        sessionDate: enrollment.session.date,
      },
      newValue: {
        status: SessionEnrollmentStatus.CANCELLED,
        sessionId: enrollment.sessionId,
        className: enrollment.session.class.className,
        sessionDate: enrollment.session.date,
        cancelledAt: cancelledEnrollment.cancelledAt,
      },
      description: `${enrollment.session.class.className} 수강 취소: ${enrollment.session.date.toLocaleDateString()}`,
    });

    return cancelledEnrollment;
  }

  /**
   * 학생의 수강 신청 목록 조회
   */
  async getStudentEnrollments(
    studentId: number,
    filters: {
      status?: SessionEnrollmentStatus;
      classId?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.prisma.sessionEnrollment.findMany({
      where: {
        studentId,
        ...(filters.status && { status: filters.status }),
        ...(filters.classId && { session: { classId: filters.classId } }),
        ...(filters.startDate &&
          filters.endDate && {
            session: {
              date: {
                gte: filters.startDate,
                lte: filters.endDate,
              },
            },
          }),
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
      },
      orderBy: [{ session: { date: 'asc' } }, { enrolledAt: 'desc' }],
    });
  }

  /**
   * 특정 세션의 수강생 목록 조회
   */
  async getSessionEnrollments(sessionId: number, teacherId: number) {
    // 세션 정보 조회
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    // 권한 확인
    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 세션의 수강생 목록을 조회할 권한이 없습니다.',
      );
    }

    // 세션의 수강생 목록 조회
    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: { sessionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            level: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
          },
        },
        refundRequests: {
          where: {
            status: {
              in: ['PENDING', 'APPROVED', 'PARTIAL_APPROVED'],
            },
          },
          select: {
            id: true,
            reason: true,
            refundAmount: true,
            status: true,
            requestedAt: true,
          },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    return {
      session: {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        class: {
          id: session.class.id,
          className: session.class.className,
          teacher: session.class.teacher,
        },
      },
      enrollments,
      totalCount: enrollments.length,
      statusCounts: {
        pending: enrollments.filter((e) => e.status === 'PENDING').length,
        confirmed: enrollments.filter((e) => e.status === 'CONFIRMED').length,
        cancelled: enrollments.filter((e) => e.status === 'CANCELLED').length,
        attended: enrollments.filter((e) => e.status === 'ATTENDED').length,
        absent: enrollments.filter((e) => e.status === 'ABSENT').length,
        completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
      },
    };
  }

  /**
   * 선생님의 모든 세션 조회 (달력용)
   */
  async getTeacherSessions(
    teacherId: number,
    filters: {
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const where: any = {
      class: {
        teacherId,
      },
      ...(filters.startDate &&
        filters.endDate && {
          date: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    };

    const sessions = await this.prisma.classSession.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            className: true,
            teacher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        enrollments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      class: session.class,
      enrollmentCount: session.enrollments.length,
      confirmedCount: session.enrollments.filter(
        (e) => e.status === 'CONFIRMED',
      ).length,
    }));
  }

  /**
   * 수강 변경 (기존 수강 취소 + 새로운 수강 신청)
   */
  async changeEnrollment(
    currentEnrollmentId: number,
    changeDto: ChangeEnrollmentDto,
    studentId: number,
  ) {
    // 기존 수강 신청 정보 조회
    const currentEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: { id: currentEnrollmentId },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });

    if (!currentEnrollment) {
      throw new NotFoundException('기존 수강 신청을 찾을 수 없습니다.');
    }

    // 권한 확인 (자신의 수강 신청만 변경 가능)
    if (currentEnrollment.studentId !== studentId) {
      throw new ForbiddenException('자신의 수강 신청만 변경할 수 있습니다.');
    }

    // 새로운 세션 정보 조회
    const newSession = await this.prisma.classSession.findUnique({
      where: { id: changeDto.newSessionId },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
      },
    });

    if (!newSession) {
      throw new NotFoundException('변경할 세션을 찾을 수 없습니다.');
    }

    // 이미 새로운 세션에 신청했는지 확인
    const existingNewEnrollment =
      await this.prisma.sessionEnrollment.findUnique({
        where: {
          studentId_sessionId: {
            studentId,
            sessionId: changeDto.newSessionId,
          },
        },
      });

    if (existingNewEnrollment) {
      throw new BadRequestException(
        '이미 신청한 세션으로는 변경할 수 없습니다.',
      );
    }

    // 기존 수업이 이미 시작된 경우 변경 불가
    const now = new Date();
    const currentSessionStartTime = new Date(
      currentEnrollment.session.startTime,
    );
    if (now >= currentSessionStartTime) {
      throw new BadRequestException(
        '기존 수업이 이미 시작되어 변경할 수 없습니다.',
      );
    }

    // 새로운 수업이 이미 시작된 경우 변경 불가
    const newSessionStartTime = new Date(newSession.startTime);
    if (now >= newSessionStartTime) {
      throw new BadRequestException(
        '변경할 수업이 이미 시작되어 변경할 수 없습니다.',
      );
    }

    // 트랜잭션으로 수강 변경 처리
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. 기존 수강 신청 취소
      const cancelledEnrollment = await prisma.sessionEnrollment.update({
        where: { id: currentEnrollmentId },
        data: {
          status: SessionEnrollmentStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: {
          session: {
            include: {
              class: {
                include: {
                  teacher: true,
                },
              },
            },
          },
          student: true,
        },
      });

      // 2. 새로운 수강 신청 생성
      const newEnrollment = await prisma.sessionEnrollment.create({
        data: {
          studentId,
          sessionId: changeDto.newSessionId,
          status: SessionEnrollmentStatus.PENDING,
        },
        include: {
          session: {
            include: {
              class: {
                include: {
                  teacher: true,
                },
              },
            },
          },
          student: true,
        },
      });

      return {
        cancelledEnrollment,
        newEnrollment,
      };
    });

    // 수강 변경 로그 (하나의 활동으로 기록)
    await this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.ENROLLMENT.CHANGE_ENROLLMENT,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId: result.newEnrollment.id,
      oldValue: {
        cancelledEnrollmentId: currentEnrollmentId,
        cancelledSessionId: currentEnrollment.sessionId,
        cancelledClassName: currentEnrollment.session.class.className,
        cancelledSessionDate: currentEnrollment.session.date,
        cancelledStatus: currentEnrollment.status,
      },
      newValue: {
        newEnrollmentId: result.newEnrollment.id,
        newSessionId: result.newEnrollment.sessionId,
        newClassName: result.newEnrollment.session.class.className,
        newSessionDate: result.newEnrollment.session.date,
        newStatus: result.newEnrollment.status,
        reason: changeDto.reason,
      },
      description: `수강 변경: ${currentEnrollment.session.class.className} → ${result.newEnrollment.session.class.className}`,
    });

    return {
      message: '수강 변경이 완료되었습니다.',
      cancelledEnrollment: result.cancelledEnrollment,
      newEnrollment: result.newEnrollment,
    };
  }

  /**
   * 학생의 특정 클래스 수강 신청 현황 조회 (수강 변경/취소용)
   */
  async getStudentClassEnrollments(classId: number, studentId: number) {
    // 해당 클래스의 모든 세션과 학생의 수강 신청 현황을 함께 조회
    const classSessions = await this.prisma.classSession.findMany({
      where: { classId },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: {
          where: { studentId },
          include: {
            student: true,
            payment: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // 각 세션별로 학생의 수강 신청 상태를 명확히 표시
    const sessionsWithEnrollmentStatus = classSessions.map((session) => {
      const studentEnrollment = session.enrollments[0]; // 학생당 세션당 하나의 수강 신청만 존재

      return {
        sessionId: session.id,
        classId: session.classId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        className: session.class.className,
        teacherName: session.class.teacher.name,
        level: session.class.level,
        tuitionFee: session.class.tuitionFee,
        // 학생의 수강 신청 정보
        enrollment: studentEnrollment
          ? {
              id: studentEnrollment.id,
              status: studentEnrollment.status,
              enrolledAt: studentEnrollment.enrolledAt,
              cancelledAt: studentEnrollment.cancelledAt,
              payment: studentEnrollment.payment,
            }
          : null,
        // 수강 가능 여부 (이미 시작된 수업은 수강 불가)
        isEnrollable: new Date(session.startTime) > new Date(),
      };
    });

    return {
      classId,
      className: classSessions[0]?.class.className,
      teacherName: classSessions[0]?.class.teacher.name,
      sessions: sessionsWithEnrollmentStatus,
    };
  }

  /**
   * 배치 수강 변경/취소 처리
   */
  async batchModifyEnrollments(
    data: {
      cancellations: number[];
      newEnrollments: number[];
      reason?: string;
    },
    studentId: number,
  ) {
    const { cancellations, newEnrollments, reason } = data;

    // 취소할 수강 신청들의 원래 상태를 미리 조회
    const enrollmentsToCancel = await this.prisma.sessionEnrollment.findMany({
      where: { id: { in: cancellations } },
      select: { id: true, status: true, sessionId: true },
    });

    // 트랜잭션으로 배치 처리
    const result = await this.prisma.$transaction(async (prisma) => {
      const cancelledEnrollments = [];
      const newEnrollmentResults = [];

      // 1. 기존 수강 신청 취소
      for (const enrollmentId of cancellations) {
        const enrollment = await prisma.sessionEnrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
            student: true,
          },
        });

        if (!enrollment) {
          throw new NotFoundException(
            `수강 신청 ID ${enrollmentId}를 찾을 수 없습니다.`,
          );
        }

        if (enrollment.studentId !== studentId) {
          throw new ForbiddenException(
            '자신의 수강 신청만 변경할 수 있습니다.',
          );
        }

        // 이미 시작된 수업은 취소 불가
        const now = new Date();
        const sessionStartTime = new Date(enrollment.session.startTime);
        if (now >= sessionStartTime) {
          throw new BadRequestException(
            `이미 시작된 수업은 취소할 수 없습니다: ${enrollment.session.class.className}`,
          );
        }

        const cancelledEnrollment = await prisma.sessionEnrollment.update({
          where: { id: enrollmentId },
          data: {
            status: SessionEnrollmentStatus.CANCELLED,
            cancelledAt: new Date(),
          },
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
            student: true,
          },
        });

        cancelledEnrollments.push(cancelledEnrollment);
      }

      // 2. 새로운 수강 신청 생성
      for (const sessionId of newEnrollments) {
        // 이미 신청했는지 확인
        const existingEnrollment = await prisma.sessionEnrollment.findUnique({
          where: {
            studentId_sessionId: {
              studentId,
              sessionId,
            },
          },
        });

        if (existingEnrollment) {
          throw new BadRequestException(
            `이미 신청한 세션입니다: 세션 ID ${sessionId}`,
          );
        }

        // 세션 정보 조회
        const session = await prisma.classSession.findUnique({
          where: { id: sessionId },
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        });

        if (!session) {
          throw new NotFoundException(
            `세션 ID ${sessionId}를 찾을 수 없습니다.`,
          );
        }

        // 이미 시작된 수업은 신청 불가
        const now = new Date();
        const sessionStartTime = new Date(session.startTime);
        if (now >= sessionStartTime) {
          throw new BadRequestException(
            `이미 시작된 수업은 신청할 수 없습니다: ${session.class.className}`,
          );
        }

        const newEnrollment = await prisma.sessionEnrollment.create({
          data: {
            studentId,
            sessionId,
            status: SessionEnrollmentStatus.PENDING,
          },
          include: {
            session: {
              include: {
                class: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
            student: true,
          },
        });

        newEnrollmentResults.push(newEnrollment);
      }

      return {
        cancelledEnrollments,
        newEnrollments: newEnrollmentResults,
      };
    });

    // CONFIRMED 상태에서 취소된 수강 신청들의 currentStudents 감소
    for (const enrollment of enrollmentsToCancel) {
      if (enrollment.status === SessionEnrollmentStatus.CONFIRMED) {
        await this.decrementSessionCurrentStudents(enrollment.sessionId);
      }
    }

    // 배치 수강 변경 로그
    await this.activityLogService.logActivityAsync({
      userId: studentId,
      userRole: 'STUDENT',
      action: ACTIVITY_TYPES.ENROLLMENT.BATCH_MODIFY_ENROLLMENT,
      entityType: ENTITY_TYPES.SESSION_ENROLLMENT,
      entityId:
        result.newEnrollments[0]?.id || result.cancelledEnrollments[0]?.id,
      oldValue: {
        cancelledEnrollmentIds: result.cancelledEnrollments.map((e) => e.id),
        cancelledSessionIds: result.cancelledEnrollments.map(
          (e) => e.sessionId,
        ),
        cancelledClassNames: result.cancelledEnrollments.map(
          (e) => e.session.class.className,
        ),
      },
      newValue: {
        newEnrollmentIds: result.newEnrollments.map((e) => e.id),
        newSessionIds: result.newEnrollments.map((e) => e.sessionId),
        newClassNames: result.newEnrollments.map(
          (e) => e.session.class.className,
        ),
        reason,
      },
      description: `배치 수강 변경: ${result.cancelledEnrollments.length}개 취소, ${result.newEnrollments.length}개 신청`,
    });

    return result;
  }

  // 헬퍼 메서드들
  private getActionForStatusChange(
    oldStatus: string,
    newStatus: string,
  ): string {
    if (newStatus === SessionEnrollmentStatus.CONFIRMED)
      return ACTIVITY_TYPES.ENROLLMENT.APPROVE_ENROLLMENT;
    if (newStatus === SessionEnrollmentStatus.CANCELLED)
      return ACTIVITY_TYPES.ENROLLMENT.REJECT_ENROLLMENT;
    if (newStatus === SessionEnrollmentStatus.COMPLETED)
      return ACTIVITY_TYPES.ENROLLMENT.COMPLETE_ENROLLMENT;
    return ACTIVITY_TYPES.ENROLLMENT.UPDATE_ENROLLMENT_STATUS;
  }

  private getBatchActionForStatusChange(
    status: SessionEnrollmentStatus,
  ): string {
    if (status === SessionEnrollmentStatus.CONFIRMED)
      return ACTIVITY_TYPES.ENROLLMENT.BATCH_APPROVE_ENROLLMENT;
    if (status === SessionEnrollmentStatus.CANCELLED)
      return ACTIVITY_TYPES.ENROLLMENT.BATCH_REJECT_ENROLLMENT;
    return ACTIVITY_TYPES.ENROLLMENT.BATCH_UPDATE_ENROLLMENT_STATUS;
  }

  private getStatusChangeDescription(
    oldStatus: string,
    newStatus: string,
  ): string {
    const statusLabels = {
      [SessionEnrollmentStatus.PENDING]: '대기',
      [SessionEnrollmentStatus.CONFIRMED]: '승인',
      [SessionEnrollmentStatus.CANCELLED]: '거부',
      [SessionEnrollmentStatus.COMPLETED]: '완료',
      [SessionEnrollmentStatus.ABSENT]: '결석',
      [SessionEnrollmentStatus.ATTENDED]: '출석',
    };

    return `${statusLabels[oldStatus]} → ${statusLabels[newStatus]}`;
  }

  /**
   * 세션의 currentStudents 증가
   */
  async incrementSessionCurrentStudents(sessionId: number) {
    await this.prisma.classSession.update({
      where: { id: sessionId },
      data: {
        currentStudents: {
          increment: 1,
        },
      },
    });
  }

  /**
   * 세션의 currentStudents 감소
   */
  async decrementSessionCurrentStudents(sessionId: number) {
    await this.prisma.classSession.update({
      where: { id: sessionId },
      data: {
        currentStudents: {
          decrement: 1,
        },
      },
    });
  }

  /**
   * 세션의 currentStudents 업데이트
   */
  private async updateSessionCurrentStudents(
    sessionId: number,
    oldStatus: string,
    newStatus: string,
  ) {
    // 상태 변경에 따른 currentStudents 증감 계산
    if (oldStatus === 'PENDING' && newStatus === 'CONFIRMED') {
      // PENDING → CONFIRMED: +1
      await this.incrementSessionCurrentStudents(sessionId);
    } else if (oldStatus === 'CONFIRMED' && newStatus === 'CANCELLED') {
      // CONFIRMED → CANCELLED: -1 (일반 취소)
      await this.decrementSessionCurrentStudents(sessionId);
    }
    // PENDING → CANCELLED: 변화 없음 (처리하지 않음)
  }

  /**
   * 환불 승인으로 인한 세션 currentStudents 감소
   * (환불 서비스에서 호출)
   * @deprecated Use decrementSessionCurrentStudents instead
   */
  async decrementSessionCurrentStudentsForRefund(sessionId: number) {
    await this.decrementSessionCurrentStudents(sessionId);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';

import {
  UpdateEnrollmentStatusDto,
  BatchUpdateEnrollmentStatusDto,
  SessionEnrollmentStatus,
} from './dto/update-enrollment-status.dto';
import { ChangeEnrollmentDto } from './dto/change-enrollment.dto';

@Injectable()
export class ClassSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketGateway: SocketGateway,
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
      throw new NotFoundException({
        code: 'CLASS_NOT_FOUND',
        message: '클래스를 찾을 수 없습니다.',
        details: { classId: data.classId },
      });
    }

    // 권한 확인
    if (classInfo.teacherId !== teacherId) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '해당 클래스의 세션을 생성할 권한이 없습니다.',
        details: {
          teacherId,
          classTeacherId: classInfo.teacherId,
          classId: data.classId,
        },
      });
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

    return session;
  }

  /**
   * userId로 Student 조회
   */
  async findStudentByUserId(userId: string) {
    // User 테이블에서 먼저 찾기
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
        details: { userId },
      });
    }

    // Student 정보 찾기
    const student = await this.prisma.student.findUnique({
      where: { userRefId: user.id },
    });

    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: 'Student를 찾을 수 없습니다.',
        details: { userRefId: user.id },
      });
    }

    return student;
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
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    // 권한 확인
    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '해당 세션을 수정할 권한이 없습니다.',
        details: {
          teacherId,
          sessionTeacherId: session.class.teacherId,
          sessionId,
        },
      });
    }

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
        enrollments: {
          include: {
            student: true,
          },
        },
      },
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
            payment: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    // 권한 확인
    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '해당 세션을 삭제할 권한이 없습니다.',
        details: {
          teacherId,
          sessionTeacherId: session.class.teacherId,
          sessionId,
        },
      });
    }

    // 수강생이 있는 경우 삭제 불가
    if (session.enrollments.length > 0) {
      throw new BadRequestException({
        code: 'SESSION_HAS_ENROLLMENTS',
        message: '수강생이 있는 세션은 삭제할 수 없습니다.',
        details: {
          enrollmentCount: session.enrollments.length,
          sessionId,
        },
      });
    }

    // 세션 삭제
    await this.prisma.classSession.delete({
      where: { id: sessionId },
    });

    return { message: '세션이 성공적으로 삭제되었습니다.' };
  }

  async getClassSessions(classId: number, studentId?: number) {
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
          enrollment.status === 'CONFIRMED' ||
          enrollment.status === 'PENDING' ||
          enrollment.status === 'REFUND_REJECTED_CONFIRMED' ||
          enrollment.status === 'REFUND_REQUESTED' ||
          enrollment.status === 'TEACHER_CANCELLED' ||
          enrollment.status === 'ABSENT' ||
          enrollment.status === 'ATTENDED',
      );

      const isEnrollable = !isPastStartTime && !isFull && !isAlreadyEnrolled;

      return {
        ...session,
        class: {
          ...session.class,
          tuitionFee: session.class.tuitionFee.toString(),
        },
        isEnrollable,
        isFull,
        isPastStartTime,
        isAlreadyEnrolled,
      };
    });

    return sessionsWithEnrollableInfo;
  }

  /**
   * 수강 변경용 모든 세션 조회
   * 클래스의 startDate/endDate를 기준으로 캘린더 범위를 계산
   */
  async getClassSessionsForModification(classId: number, userId: number) {
    // Student 테이블에서 userRefId로 직접 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      select: { id: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const studentId = student.id;
    // 클래스 정보 조회 (startDate, endDate 포함)
    const classInfo = await this.prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        className: true,
        startDate: true,
        endDate: true,
        maxStudents: true,
        tuitionFee: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!classInfo || !classInfo.startDate || !classInfo.endDate) {
      return {
        sessions: [],
        calendarRange: null,
      };
    }

    // 클래스의 모든 세션 조회
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
          where: { studentId },
          include: {
            student: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const now = new Date();

    const sessionsWithMetadata = sessions.map((session) => {
      // session.date와 session.startTime을 조합해서 정확한 날짜시간 생성
      const sessionDate = new Date(session.date);
      const sessionStartTimeStr = session.startTime.toTimeString().slice(0, 5);
      const [hours, minutes] = sessionStartTimeStr.split(':').map(Number);
      const sessionStartTime = new Date(sessionDate);
      sessionStartTime.setHours(hours, minutes, 0, 0);

      // 기본 조건들
      const isPastStartTime = now >= sessionStartTime;
      const isFull = session.currentStudents >= session.class.maxStudents;
      const isAlreadyEnrolled = session.enrollments.some(
        (enrollment) =>
          enrollment.status === 'CONFIRMED' ||
          enrollment.status === 'PENDING' ||
          enrollment.status === 'REFUND_REJECTED_CONFIRMED' ||
          enrollment.status === 'REFUND_REQUESTED' ||
          enrollment.status === 'TEACHER_CANCELLED' ||
          enrollment.status === 'ABSENT' ||
          enrollment.status === 'ATTENDED',
      );

      // 수강 변경 가능 여부 (새로 신청 가능한 세션)
      const isSelectable = !isPastStartTime && !isFull && !isAlreadyEnrolled;

      // 환불 신청 가능 여부 (이미 신청했지만 취소 가능한 세션)
      const canBeCancelled =
        !isPastStartTime &&
        session.enrollments.some(
          (enrollment) =>
            enrollment.status === 'PENDING' ||
            enrollment.status === 'CONFIRMED' ||
            enrollment.status === 'REFUND_REJECTED_CONFIRMED',
        );

      // 전체 선택 가능 여부 (수강 변경 또는 환불 신청 중 하나라도 가능)
      const isModifiable = isSelectable || canBeCancelled;

      return {
        ...session,
        class: {
          ...session.class,
          tuitionFee: session.class.tuitionFee.toString(),
        },
        isSelectable,
        canBeCancelled,
        isModifiable,
        isPastStartTime,
        isFull,
        isAlreadyEnrolled,
        // 기존 호환성을 위한 필드들
        isEnrollable: isSelectable,
      };
    });

    return {
      sessions: sessionsWithMetadata,
      calendarRange: {
        startDate: classInfo.startDate,
        endDate: classInfo.endDate,
      },
    };
  }

  /**
   * 선택된 클래스들의 모든 세션 조회 (enrollment/modification 모드용)
   * 클래스의 startDate/endDate를 기준으로 캘린더 범위를 계산
   */
  async getClassSessionsForEnrollment(classIds: number[], userId?: number) {
    // User 테이블의 id로 Student 테이블의 id를 찾기
    let studentId: number | undefined;
    if (userId) {
      const student = await this.prisma.student.findUnique({
        where: { userRefId: userId },
        select: { id: true },
      });
      studentId = student?.id;
    }
    // 선택된 클래스들의 정보 조회 (startDate, endDate 포함)
    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      select: {
        id: true,
        className: true,
        startDate: true,
        endDate: true,
        maxStudents: true,
        tuitionFee: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (classes.length === 0) {
      return {
        sessions: [],
        calendarRange: null,
      };
    }

    // 캘린더 범위 계산 (가장 빠른 startDate ~ 가장 늦은 endDate)
    const startDates = classes.map((cls) => cls.startDate).filter(Boolean);
    const endDates = classes.map((cls) => cls.endDate).filter(Boolean);

    if (startDates.length === 0 || endDates.length === 0) {
      return {
        sessions: [],
        calendarRange: null,
      };
    }

    const earliestStartDate = new Date(
      Math.min(...startDates.map((d) => d.getTime())),
    );
    const latestEndDate = new Date(
      Math.max(...endDates.map((d) => d.getTime())),
    );

    // 선택된 클래스들의 모든 세션 조회
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId: { in: classIds },
      },
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

    return {
      sessions: this.addSessionMetadata(sessions, studentId),
      calendarRange: {
        startDate: earliestStartDate,
        endDate: latestEndDate,
      },
    };
  }

  /**
   * 학생의 수강 가능한 모든 세션 조회 (새로운 수강신청 플로우용)
   * 학원 내 모든 클래스의 startDate/endDate를 기준으로 캘린더 범위를 계산
   */
  async getStudentAvailableSessionsForEnrollment(
    academyId: number,
    userId: number, // User 테이블의 id
  ) {
    // Student 테이블에서 userRefId로 직접 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      select: { id: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const studentId = student.id;
    // 해당 학원의 모든 클래스 조회
    const classes = await this.prisma.class.findMany({
      where: { academyId },
      select: {
        id: true,
        className: true,
        startDate: true,
        endDate: true,
        maxStudents: true,
        tuitionFee: true,
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (classes.length === 0) {
      return {
        sessions: [],
        calendarRange: null,
      };
    }

    // 캘린더 범위 계산 (가장 빠른 startDate ~ 가장 늦은 endDate)
    const startDates = classes.map((cls) => cls.startDate).filter(Boolean);
    const endDates = classes.map((cls) => cls.endDate).filter(Boolean);

    if (startDates.length === 0 || endDates.length === 0) {
      return {
        sessions: [],
        calendarRange: null,
      };
    }

    const earliestStartDate = new Date(
      Math.min(...startDates.map((d) => d.getTime())),
    );
    const latestEndDate = new Date(
      Math.max(...endDates.map((d) => d.getTime())),
    );

    const classIds = classes.map((cls) => cls.id);

    // 해당 클래스들의 모든 세션 조회
    const sessions = await this.prisma.classSession.findMany({
      where: {
        classId: { in: classIds },
      },
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
          where: { studentId },
          include: {
            student: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return {
      sessions: this.addSessionMetadata(sessions, studentId),
      calendarRange: {
        startDate: earliestStartDate,
        endDate: latestEndDate,
      },
    };
  }

  /**
   * 세션 메타데이터 추가 헬퍼 메서드
   */
  private addSessionMetadata(sessions: any[], _studentId?: number) {
    const now = new Date();

    return sessions.map((session) => {
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
          enrollment.status === 'CONFIRMED' ||
          enrollment.status === 'PENDING' ||
          enrollment.status === 'REFUND_REJECTED_CONFIRMED' ||
          enrollment.status === 'REFUND_REQUESTED' ||
          enrollment.status === 'TEACHER_CANCELLED' ||
          enrollment.status === 'ABSENT' ||
          enrollment.status === 'ATTENDED',
      );

      const isEnrollable = !isPastStartTime && !isFull && !isAlreadyEnrolled;

      return {
        ...session,
        class: {
          ...session.class,
          tuitionFee: session.class.tuitionFee.toString(),
        },
        isEnrollable,
        isFull,
        isPastStartTime,
        isAlreadyEnrolled,
      };
    });
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
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId: id },
      });
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
      throw new NotFoundException({
        code: 'SESSION_NOT_FOUND',
        message: '세션을 찾을 수 없습니다.',
        details: { sessionId },
      });
    }

    // 기존 수강 신청 확인 (모든 상태)
    const existingEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

    if (existingEnrollment) {
      // 활성 상태인 경우 중복 신청 불가 (수강신청 불가능한 상태들)
      if (
        [
          'PENDING',
          'CONFIRMED',
          'REFUND_REJECTED_CONFIRMED',
          'REFUND_REQUESTED',
          'TEACHER_CANCELLED',
          'ABSENT',
          'ATTENDED',
        ].includes(existingEnrollment.status)
      ) {
        throw new ConflictException({
          code: 'ALREADY_ENROLLED',
          message: '이미 수강 신청한 세션입니다.',
          details: {
            studentId,
            sessionId,
            existingStatus: existingEnrollment.status,
          },
        });
      }

      // 비활성 상태(CANCELLED, REJECTED 등)인 경우 기존 수강신청을 삭제하고 새로운 수강신청 생성
      await this.prisma.sessionEnrollment.delete({
        where: {
          studentId_sessionId: {
            studentId,
            sessionId,
          },
        },
      });

      // 세션 정보 조회 (tuitionFee 필요)
      const sessionForPayment = await this.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: {
            select: {
              tuitionFee: true,
            },
          },
        },
      });

      // 새로운 SessionEnrollment와 Payment를 트랜잭션으로 함께 생성
      const newEnrollment = await this.prisma.$transaction(async (tx) => {
        // SessionEnrollment 생성
        const enrollment = await tx.sessionEnrollment.create({
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

        // Payment 생성 (method: BANK_TRANSFER, status: PENDING)
        await tx.payment.create({
          data: {
            studentId,
            sessionEnrollmentId: enrollment.id,
            amount: sessionForPayment.class.tuitionFee,
            method: 'BANK_TRANSFER',
            status: 'PENDING',
          },
        });

        return enrollment;
      });

      return newEnrollment;
    }

    if (session.currentStudents >= session.class.maxStudents) {
      throw new BadRequestException({
        code: 'SESSION_FULL',
        message: '수강 인원이 초과되었습니다.',
        details: {
          currentStudents: session.currentStudents,
          maxStudents: session.class.maxStudents,
          sessionId,
        },
      });
    }

    const now = new Date();

    // session.date와 session.startTime을 조합해서 정확한 날짜시간 생성
    const sessionDate = new Date(session.date);
    const sessionStartTimeStr = session.startTime.toTimeString().slice(0, 5); // "HH:MM" 형식
    const [hours, minutes] = sessionStartTimeStr.split(':').map(Number);

    const sessionStartTime = new Date(sessionDate);
    sessionStartTime.setHours(hours, minutes, 0, 0);

    if (now >= sessionStartTime) {
      throw new BadRequestException({
        code: 'SESSION_ALREADY_STARTED',
        message: '이미 시작된 수업은 신청할 수 없습니다.',
        details: {
          sessionStartTime: sessionStartTime.toISOString(),
          currentTime: now.toISOString(),
          sessionId,
        },
      });
    }

    // SessionEnrollment와 Payment를 트랜잭션으로 함께 생성
    const enrollment = await this.prisma.$transaction(async (tx) => {
      // SessionEnrollment 생성
      const newEnrollment = await tx.sessionEnrollment.create({
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

      // Payment 생성 (method: BANK_TRANSFER, status: PENDING)
      await tx.payment.create({
        data: {
          studentId,
          sessionEnrollmentId: newEnrollment.id,
          amount: session.class.tuitionFee,
          method: 'BANK_TRANSFER',
          status: 'PENDING',
        },
      });

      return newEnrollment;
    });

    // 활동 로그 기록 (비동기)

    // Socket 이벤트 발생 - 새로운 수강신청 요청 알림
    this.socketGateway.notifyNewEnrollmentRequest(
      enrollment.id,
      enrollment.studentId,
      enrollment.sessionId,
      enrollment.session.class.academyId,
    );

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
    const updateData: any = { status: newStatus };

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
      enrollmentId,
    );

    // 활동 로그 기록
    // const action = this.getActionForStatusChange(oldStatus, newStatus);

    return updatedEnrollment;
  }

  /**
   * 배치 수강 신청 상태 업데이트
   */
  async batchUpdateEnrollmentStatus(
    batchDto: BatchUpdateEnrollmentStatusDto,
    teacherId: number,
  ) {
    const { enrollmentIds, status } = batchDto;

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
   * 수업 시간이 지났는데 출석 기록이 없으면 자동으로 ABSENT 처리
   */
  async updateCompletedSessions() {
    const now = new Date();

    // 종료된 세션의 수강 신청 조회 (CONFIRMED 상태만)
    const completedEnrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        status: SessionEnrollmentStatus.CONFIRMED,
        session: {
          endTime: { lt: now },
        },
      },
      include: {
        session: {
          select: {
            id: true,
            date: true,
            classId: true,
            endTime: true,
          },
        },
      },
    });

    let absentCount = 0;

    // 각 수강 신청에 대해 출석 기록 확인 및 자동 ABSENT 처리
    for (const enrollment of completedEnrollments) {
      const sessionDate = new Date(enrollment.session.date);
      const sessionDateStart = new Date(sessionDate);
      sessionDateStart.setHours(0, 0, 0, 0);
      const sessionDateEnd = new Date(sessionDate);
      sessionDateEnd.setHours(23, 59, 59, 999);

      // 해당 날짜의 출석 기록 확인
      const existingAttendance = await this.prisma.attendance.findFirst({
        where: {
          sessionEnrollmentId: enrollment.id,
          date: {
            gte: sessionDateStart,
            lt: sessionDateEnd,
          },
        } as any,
      });

      // 출석 기록이 없으면 자동으로 ABSENT 처리
      if (!existingAttendance) {
        await this.prisma.attendance.create({
          data: {
            sessionEnrollmentId: enrollment.id,
            classId: enrollment.session.classId,
            studentId: enrollment.studentId,
            date: sessionDate,
            status: 'ABSENT',
            note: '자동 처리: 수업 시간 경과 후 출석 기록 없음',
          } as any,
        });
        absentCount++;
      }
    }

    // 배치 완료 로그
    if (completedEnrollments.length > 0) {
    }

    return {
      processedCount: completedEnrollments.length,
      absentCount,
      message: `${completedEnrollments.length}개의 수강 신청 처리 완료 (${absentCount}개 자동 결석 처리)`,
    };
  }

  /**
   * 출석 체크 (수업 당일)
   */
  async checkAttendance(
    enrollmentId: number,
    attendanceStatus: 'PRESENT' | 'ABSENT',
    userId: number,
    userRole: string,
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
    if (userRole === 'TEACHER') {
      // Teacher 권한 로직: 본인이 담당하는 클래스의 세션만 출석체크 가능
      const teacher = await this.prisma.teacher.findUnique({
        where: { userRefId: userId },
        select: { id: true },
      });

      if (!teacher) {
        throw new ForbiddenException('Teacher를 찾을 수 없습니다.');
      }

      if (enrollment.session.class.teacherId !== teacher.id) {
        throw new ForbiddenException(
          '해당 클래스의 출석을 관리할 권한이 없습니다.',
        );
      }
    } else if (userRole === 'PRINCIPAL') {
      // Principal 권한 로직: 해당 학원 소속의 모든 클래스/세션 출석체크 가능
      const principal = await this.prisma.principal.findUnique({
        where: { userRefId: userId },
        include: {
          academy: {
            include: {
              classes: {
                where: { id: enrollment.session.classId },
              },
            },
          },
        },
      });

      if (!principal) {
        throw new ForbiddenException('Principal을 찾을 수 없습니다.');
      }

      // 세션이 해당 학원의 클래스에 속하는지 확인
      const classExists = principal.academy.classes.some(
        (cls) => cls.id === enrollment.session.classId,
      );

      if (!classExists) {
        throw new ForbiddenException(
          '해당 클래스의 출석을 관리할 권한이 없습니다.',
        );
      }
    } else {
      throw new ForbiddenException('유효하지 않은 사용자 역할입니다.');
    }

    // 수업 당일인지 확인
    const today = new Date();
    const sessionDate = new Date(enrollment.session.date);
    const isSameDay = today.toDateString() === sessionDate.toDateString();

    if (!isSameDay) {
      throw new BadRequestException({
        code: 'ATTENDANCE_CHECK_INVALID_DATE',
        message: '출석 체크는 수업 당일에만 가능합니다.',
        details: {
          enrollmentId: enrollment.id,
          sessionDate: sessionDate.toISOString(),
          currentDate: today.toISOString(),
        },
      });
    }

    // Attendance 테이블에 출석 기록 생성 또는 업데이트
    const sessionDateForAttendance = new Date(enrollment.session.date);
    const sessionDateStart = new Date(sessionDateForAttendance);
    sessionDateStart.setHours(0, 0, 0, 0);
    const sessionDateEnd = new Date(sessionDateForAttendance);
    sessionDateEnd.setHours(23, 59, 59, 999);

    // Attendance 레코드 찾기 (이미 존재하는지 확인)
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        sessionEnrollmentId: enrollmentId,
        date: {
          gte: sessionDateStart,
          lt: sessionDateEnd,
        },
      } as any,
    });

    // Attendance 레코드 생성 또는 업데이트
    const attendance = existingAttendance
      ? await this.prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status: attendanceStatus, // 'PRESENT' 또는 'ABSENT'
          },
        })
      : await this.prisma.attendance.create({
          data: {
            sessionEnrollmentId: enrollmentId,
            classId: enrollment.session.classId,
            studentId: enrollment.studentId,
            date: sessionDateForAttendance,
            status: attendanceStatus, // 'PRESENT' 또는 'ABSENT'
          } as any,
        });

    // SessionEnrollment는 수정하지 않음 (수강 신청 상태만 관리)
    const updatedEnrollment = await this.prisma.sessionEnrollment.findUnique({
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

    // 출석 체크 로그

    return {
      ...updatedEnrollment,
      attendance, // 출석 기록 정보 포함
    };
  }

  /**
   * 일괄 출석 체크 (수업 당일)
   * 여러 학생의 출석 상태를 한 번에 업데이트
   */
  async batchCheckAttendance(
    sessionId: number,
    attendances: Array<{ enrollmentId: number; status: 'PRESENT' | 'ABSENT' }>,
    userId: number,
    userRole: string,
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
    if (userRole === 'TEACHER') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userRefId: userId },
        select: { id: true },
      });

      if (!teacher || session.class.teacherId !== teacher.id) {
        throw new ForbiddenException(
          '해당 클래스의 출석을 관리할 권한이 없습니다.',
        );
      }
    } else if (userRole === 'PRINCIPAL') {
      const principal = await this.prisma.principal.findUnique({
        where: { userRefId: userId },
        include: {
          academy: {
            include: {
              classes: {
                where: { id: session.classId },
              },
            },
          },
        },
      });

      if (!principal) {
        throw new ForbiddenException('Principal을 찾을 수 없습니다.');
      }

      const classExists = principal.academy.classes.some(
        (cls) => cls.id === session.classId,
      );

      if (!classExists) {
        throw new ForbiddenException(
          '해당 클래스의 출석을 관리할 권한이 없습니다.',
        );
      }
    } else {
      throw new ForbiddenException('유효하지 않은 사용자 역할입니다.');
    }

    // 수업 당일인지 확인
    const today = new Date();
    const sessionDate = new Date(session.date);
    const isSameDay = today.toDateString() === sessionDate.toDateString();

    if (!isSameDay) {
      throw new BadRequestException({
        code: 'ATTENDANCE_CHECK_INVALID_DATE',
        message: '출석 체크는 수업 당일에만 가능합니다.',
        details: {
          sessionId,
          sessionDate: sessionDate.toISOString(),
          currentDate: today.toISOString(),
        },
      });
    }

    // 모든 enrollmentId가 해당 세션에 속하는지 확인
    const enrollmentIds = attendances.map((a) => a.enrollmentId);
    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        id: { in: enrollmentIds },
        sessionId,
      },
      include: {
        student: true,
      },
    });

    if (enrollments.length !== enrollmentIds.length) {
      throw new NotFoundException('일부 수강 신청을 찾을 수 없습니다.');
    }

    // 일괄 출석 체크 처리 (트랜잭션)
    const sessionDateForAttendance = new Date(session.date);
    const sessionDateStart = new Date(sessionDateForAttendance);
    sessionDateStart.setHours(0, 0, 0, 0);
    const sessionDateEnd = new Date(sessionDateForAttendance);
    sessionDateEnd.setHours(23, 59, 59, 999);

    const results = await this.prisma.$transaction(async (tx) => {
      const attendanceResults = [];

      for (const attendanceItem of attendances) {
        const enrollment = enrollments.find(
          (e) => e.id === attendanceItem.enrollmentId,
        );

        if (!enrollment) {
          continue;
        }

        // 기존 Attendance 레코드 찾기
        const existingAttendance = await (tx as any).attendance.findFirst({
          where: {
            sessionEnrollmentId: attendanceItem.enrollmentId,
            date: {
              gte: sessionDateStart,
              lt: sessionDateEnd,
            },
          },
        });

        // Attendance 레코드 생성 또는 업데이트
        const attendance = existingAttendance
          ? await (tx as any).attendance.update({
              where: { id: existingAttendance.id },
              data: {
                status: attendanceItem.status,
              },
            })
          : await (tx as any).attendance.create({
              data: {
                sessionEnrollmentId: attendanceItem.enrollmentId,
                classId: session.classId,
                studentId: enrollment.studentId,
                date: sessionDateForAttendance,
                status: attendanceItem.status,
              },
            });

        attendanceResults.push({
          enrollmentId: attendanceItem.enrollmentId,
          status: attendanceItem.status,
          attendance,
        });
      }

      return attendanceResults;
    });

    // 출석 체크 로그

    return {
      sessionId,
      totalCount: results.length,
      results,
    };
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
      throw new BadRequestException({
        code: 'ENROLLMENT_ALREADY_CANCELLED',
        message: '이미 취소된 수강 신청입니다.',
        details: {
          enrollmentId: enrollment.id,
          status: enrollment.status,
        },
      });
    }

    // 수업이 이미 시작된 경우 취소 불가
    const now = new Date();
    const sessionStartTime = new Date(enrollment.session.startTime);
    if (now >= sessionStartTime) {
      throw new BadRequestException({
        code: 'ENROLLMENT_CANNOT_CANCEL',
        message: '수업이 이미 시작되어 취소할 수 없습니다.',
        details: {
          enrollmentId: enrollment.id,
          sessionStartTime: sessionStartTime.toISOString(),
          currentTime: now.toISOString(),
        },
      });
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
      await this.updateSessionCurrentStudents(
        enrollment.sessionId,
        oldStatus,
        SessionEnrollmentStatus.CANCELLED,
        enrollmentId,
      );
    }

    // 수강 취소 로그

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
  async getSessionEnrollments(sessionId: number, userId: number) {
    // 먼저 teacher 정보를 userRefId로 조회
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

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
    if (session.class.teacherId !== teacher.id) {
      throw new ForbiddenException(
        '해당 세션의 수강생 목록을 조회할 권한이 없습니다.',
      );
    }

    // 세션의 CONFIRMED 상태 수강신청 조회
    const confirmedEnrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        sessionId,
        status: 'CONFIRMED',
      },
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

    // 각 수강신청에 대한 Attendance 조회
    const sessionDate = new Date(session.date);
    const sessionDateStart = new Date(sessionDate);
    sessionDateStart.setHours(0, 0, 0, 0);
    const sessionDateEnd = new Date(sessionDate);
    sessionDateEnd.setHours(23, 59, 59, 999);

    const enrollmentIds = confirmedEnrollments.map((e) => e.id);
    const attendances = await this.prisma.attendance.findMany({
      where: {
        sessionEnrollmentId: { in: enrollmentIds },
        date: {
          gte: sessionDateStart,
          lt: sessionDateEnd,
        },
      } as any,
    });

    // enrollmentId를 키로 하는 Map 생성
    const attendanceMap = new Map(
      attendances.map((a: any) => [a.sessionEnrollmentId, a]),
    );

    // 응답 형식 변환 (Attendance 기반)
    const enrollments = confirmedEnrollments.map((enrollment) => {
      const attendance = attendanceMap.get(enrollment.id);
      return {
        id: enrollment.id,
        studentId: enrollment.studentId,
        sessionId: enrollment.sessionId,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        cancelledAt: enrollment.cancelledAt,
        attendanceStatus: attendance?.status || 'ABSENT', // 'PRESENT' 또는 'ABSENT'
        student: enrollment.student,
        payment: enrollment.payment,
        refundRequests: enrollment.refundRequests,
      };
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
        confirmed: enrollments.filter((e) => e.status === 'CONFIRMED').length,
        // 출석 상태는 Attendance 테이블에서 계산
        present: enrollments.filter((e) => e.attendanceStatus === 'PRESENT')
          .length,
        absent: enrollments.filter((e) => e.attendanceStatus === 'ABSENT')
          .length,
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
      enrollmentCount: session.currentStudents || 0,
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

    return {
      message: '수강 변경이 완료되었습니다.',
      cancelledEnrollment: result.cancelledEnrollment,
      newEnrollment: result.newEnrollment,
    };
  }

  /**
   * 학생의 특정 클래스 수강 신청 현황 조회 (수강 변경/취소용)
   */
  async getStudentClassEnrollments(classId: number, userId: number) {
    // Student 테이블에서 userRefId로 직접 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      select: { id: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const studentId = student.id;
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
    userId: number, // studentId 대신 userId로 변경
  ) {
    const { cancellations, newEnrollments } = data;

    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
    });

    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    const studentId = student.id;

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

        // session.date와 session.startTime을 조합해서 정확한 날짜시간 생성
        const sessionDate = new Date(enrollment.session.date);
        const sessionStartTimeStr = enrollment.session.startTime
          .toTimeString()
          .slice(0, 5); // "HH:MM" 형식
        const [hours, minutes] = sessionStartTimeStr.split(':').map(Number);

        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(hours, minutes, 0, 0);

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
        // 기존 수강 신청 확인 (모든 상태)
        const existingEnrollment = await prisma.sessionEnrollment.findUnique({
          where: {
            studentId_sessionId: {
              studentId,
              sessionId,
            },
          },
        });

        if (existingEnrollment) {
          // 활성 상태인 경우 중복 신청 불가
          if (
            ['PENDING', 'CONFIRMED', 'REFUND_REJECTED_CONFIRMED'].includes(
              existingEnrollment.status,
            )
          ) {
            throw new BadRequestException(
              `이미 신청한 세션입니다: 세션 ID ${sessionId}`,
            );
          }

          // 비활성 상태인 경우 기존 수강신청을 PENDING으로 업데이트
          const updatedEnrollment = await prisma.sessionEnrollment.update({
            where: {
              studentId_sessionId: {
                studentId,
                sessionId,
              },
            },
            data: {
              status: SessionEnrollmentStatus.PENDING,
              enrolledAt: new Date(),
              cancelledAt: null,
              rejectedAt: null,
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

          newEnrollmentResults.push(updatedEnrollment);
          continue; // 다음 세션으로 넘어감
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

        // session.date와 session.startTime을 조합해서 정확한 날짜시간 생성
        const sessionDate = new Date(session.date);
        const sessionStartTimeStr = session.startTime
          .toTimeString()
          .slice(0, 5); // "HH:MM" 형식
        const [hours, minutes] = sessionStartTimeStr.split(':').map(Number);

        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(hours, minutes, 0, 0);

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
        await this.updateSessionCurrentStudents(
          enrollment.sessionId,
          enrollment.status,
          SessionEnrollmentStatus.CANCELLED,
          enrollment.id,
        );
      }
    }

    // 배치 수강 변경 로그

    return result;
  }

  // 헬퍼 메서드들
  private getActionForStatusChange(
    oldStatus: string,
    newStatus: string,
  ): string {
    if (newStatus === SessionEnrollmentStatus.CONFIRMED)
      return 'APPROVE_ENROLLMENT';
    if (newStatus === SessionEnrollmentStatus.CANCELLED)
      return 'REJECT_ENROLLMENT';
    if (newStatus === 'CONFIRMED') return 'COMPLETE_ENROLLMENT';
    return 'UPDATE_ENROLLMENT_STATUS';
  }

  private getBatchActionForStatusChange(
    status: SessionEnrollmentStatus,
  ): string {
    if (status === SessionEnrollmentStatus.CONFIRMED)
      return 'BATCH_APPROVE_ENROLLMENT';
    if (status === SessionEnrollmentStatus.CANCELLED)
      return 'BATCH_REJECT_ENROLLMENT';
    return 'BATCH_UPDATE_ENROLLMENT_STATUS';
  }

  private getStatusChangeDescription(
    oldStatus: string,
    newStatus: string,
  ): string {
    const statusLabels = {
      PENDING: '대기',
      CONFIRMED: '승인',
      REJECTED: '거절',
      CANCELLED: '학생 취소',
      REFUND_REQUESTED: '환불 요청',
      REFUND_CANCELLED: '환불 승인',
      TEACHER_CANCELLED: '선생님 취소',
    };

    return `${statusLabels[oldStatus] || oldStatus} → ${statusLabels[newStatus] || newStatus}`;
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
   * 세션의 currentStudents 업데이트 (기여 여부 기반)
   */
  async updateSessionCurrentStudents(
    sessionId: number,
    oldStatus: string,
    newStatus: string,
    enrollmentId?: number,
  ) {
    // 기존 기여 여부 확인
    let wasContributing = false;
    if (enrollmentId) {
      const enrollment = await this.prisma.sessionEnrollment.findUnique({
        where: { id: enrollmentId },
        select: { hasContributedToCurrentStudents: true },
      });
      wasContributing = enrollment?.hasContributedToCurrentStudents || false;
    } else {
      // enrollmentId가 없는 경우 oldStatus로 판단
      wasContributing = this.shouldContributeToCurrentStudents(oldStatus);
    }

    // 새로운 기여 여부 확인
    const willContribute = this.shouldContributeToCurrentStudents(newStatus);

    // 기여 여부 변화에 따른 currentStudents 증감
    if (!wasContributing && willContribute) {
      // 기여하지 않았는데 기여하게 됨: +1
      await this.incrementSessionCurrentStudents(sessionId);
      if (enrollmentId) {
        await this.updateEnrollmentContributionStatus(enrollmentId, true);
      }
    } else if (wasContributing && !willContribute) {
      // 기여했는데 기여하지 않게 됨: -1
      await this.decrementSessionCurrentStudents(sessionId);
      if (enrollmentId) {
        await this.updateEnrollmentContributionStatus(enrollmentId, false);
      }
    }
    // wasContributing === willContribute인 경우: 변화 없음
  }

  /**
   * 상태가 currentStudents에 기여하는지 확인
   */
  private shouldContributeToCurrentStudents(status: string): boolean {
    return status === 'CONFIRMED' || status === 'REFUND_REJECTED_CONFIRMED';
  }

  /**
   * Enrollment의 currentStudents 기여 여부 업데이트
   */
  private async updateEnrollmentContributionStatus(
    enrollmentId: number,
    hasContributed: boolean,
  ) {
    await this.prisma.sessionEnrollment.update({
      where: { id: enrollmentId },
      data: {
        hasContributedToCurrentStudents: hasContributed,
      },
    });
  }

  /**
   * 환불 승인으로 인한 세션 currentStudents 감소
   * (환불 서비스에서 호출)
   * @deprecated Use decrementSessionCurrentStudents instead
   */
  async decrementSessionCurrentStudentsForRefund(sessionId: number) {
    await this.prisma.classSession.update({
      where: { id: sessionId },
      data: {
        currentStudents: {
          decrement: 1,
        },
      },
    });
  }

  // 수강 신청/환불 신청 관리 관련 메서드들
  async getSessionEnrollmentRequests(sessionId: number, teacherId: number) {
    // 세션 정보 조회 및 권한 확인
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

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 세션의 요청을 조회할 권한이 없습니다.',
      );
    }

    // PENDING 상태의 수강 신청 조회
    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        sessionId: sessionId,
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    return enrollments;
  }

  async getSessionRefundRequests(sessionId: number, teacherId: number) {
    // 세션 정보 조회 및 권한 확인
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

    if (session.class.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 세션의 요청을 조회할 권한이 없습니다.',
      );
    }

    // PENDING 상태의 환불 요청 조회
    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        sessionEnrollment: {
          sessionId: sessionId,
        },
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        sessionEnrollment: {
          select: {
            id: true,
            enrolledAt: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'asc',
      },
    });

    return refundRequests;
  }

  async approveEnrollment(enrollmentId: number, teacherId: number) {
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

    // 권한 확인
    if (enrollment.session.class.teacherId !== teacherId) {
      throw new ForbiddenException('해당 수강 신청을 승인할 권한이 없습니다.');
    }

    // 상태 확인
    if (enrollment.status !== 'PENDING') {
      throw new BadRequestException(
        '대기 중인 수강 신청만 승인할 수 있습니다.',
      );
    }

    // 수강 신청 승인 및 Payment 상태 업데이트 (트랜잭션)
    const updatedEnrollment = await this.prisma.$transaction(async (tx) => {
      // SessionEnrollment 상태 업데이트
      const enrollment = await tx.sessionEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'CONFIRMED',
        },
        include: {
          student: true,
          session: {
            include: {
              class: true,
            },
          },
        },
      });

      // Payment 상태를 PENDING → COMPLETED로 변경
      await tx.payment
        .update({
          where: { sessionEnrollmentId: enrollmentId },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        })
        .catch(() => {
          // Payment가 없는 경우 무시 (기존 데이터 호환성)
          console.warn(
            `Payment not found for enrollment ${enrollmentId}, skipping payment update`,
          );
        });

      // Attendance 레코드 생성 (기본 상태: ABSENT)
      const sessionDate = new Date(enrollment.session.date);
      await (tx as any).attendance
        .create({
          data: {
            sessionEnrollmentId: enrollmentId,
            classId: enrollment.session.classId,
            studentId: enrollment.studentId,
            date: sessionDate,
            status: 'ABSENT',
          },
        })
        .catch(() => {
          // 이미 Attendance 레코드가 있는 경우 무시
          console.warn(
            `Attendance already exists for enrollment ${enrollmentId}, skipping attendance creation`,
          );
        });

      return enrollment;
    });

    // 세션 현재 학생 수 증가
    await this.updateSessionCurrentStudents(
      enrollment.sessionId,
      'PENDING',
      'CONFIRMED',
      enrollmentId,
    );

    // 활동 로그 기록

    // Socket 이벤트 발생 - 수강신청 승인 알림
    try {
      // Student의 userRefId 조회
      const student = await this.prisma.student.findUnique({
        where: { id: updatedEnrollment.studentId },
        select: { userRefId: true },
      });

      if (student) {
        this.socketGateway.notifyEnrollmentAccepted(
          updatedEnrollment.id,
          student.userRefId,
          updatedEnrollment.sessionId,
        );
      }
    } catch (e) {
      console.warn('Socket notifyEnrollmentAccepted failed:', e);
    }

    return updatedEnrollment;
  }

  async rejectEnrollment(
    enrollmentId: number,
    data: { reason: string; detailedReason?: string },
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

    // 권한 확인
    if (enrollment.session.class.teacherId !== teacherId) {
      throw new ForbiddenException('해당 수강 신청을 거절할 권한이 없습니다.');
    }

    // 상태 확인
    if (enrollment.status !== 'PENDING') {
      throw new BadRequestException(
        '대기 중인 수강 신청만 거절할 수 있습니다.',
      );
    }

    // 트랜잭션으로 수강 신청 거절 및 거절 상세 정보 생성
    const result = await this.prisma.$transaction(async (prisma) => {
      // 수강 신청 상태 변경
      const updatedEnrollment = await prisma.sessionEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
        include: {
          student: true,
          session: {
            include: {
              class: true,
            },
          },
        },
      });

      // Payment 상태를 PENDING → CANCELLED로 변경
      await prisma.payment
        .update({
          where: { sessionEnrollmentId: enrollmentId },
          data: {
            status: 'CANCELLED',
          },
        })
        .catch(() => {
          // Payment가 없는 경우 무시 (기존 데이터 호환성)
          console.warn(
            `Payment not found for enrollment ${enrollmentId}, skipping payment update`,
          );
        });

      // 거절 상세 정보 생성
      await prisma.rejectionDetail.create({
        data: {
          rejectionType: 'SESSION_ENROLLMENT_REJECTION',
          entityId: enrollmentId,
          entityType: 'SessionEnrollment',
          reason: data.reason,
          detailedReason: data.detailedReason,
          rejectedBy: teacherId,
        },
      });

      return updatedEnrollment;
    });

    // 활동 로그 기록

    // Socket 이벤트 발생 - 수강신청 거절 알림
    try {
      // Student의 userRefId 조회
      const student = await this.prisma.student.findUnique({
        where: { id: result.studentId },
        select: { userRefId: true },
      });

      if (student) {
        this.socketGateway.notifyEnrollmentRejected(
          result.id,
          student.userRefId,
        );
      }
    } catch (e) {
      console.warn('Socket notifyEnrollmentRejected failed:', e);
    }

    return result;
  }

  // Principal의 학원 모든 수강신청 조회
  async getPrincipalEnrollments(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        session: {
          class: {
            academyId: principal.academyId,
          },
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        session: {
          include: {
            class: {
              select: {
                id: true,
                className: true,
                level: true,
                tuitionFee: true,
                teacher: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments;
  }

  // Principal의 학원 모든 세션 조회
  async getPrincipalSessions(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            classes: {
              include: {
                teacher: true,
                classSessions: {
                  include: {
                    enrollments: {
                      include: {
                        student: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 현재 시간 (KST 기준)
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 모든 세션을 평면화하여 반환 (아직 기간이 지나지 않은 세션만)
    const allSessions = [];
    for (const classItem of principal.academy.classes) {
      for (const session of classItem.classSessions) {
        // 세션의 종료 시간 계산
        const sessionDate = new Date(session.date);
        const sessionEndTime = new Date(sessionDate);

        // endTime을 시간과 분으로 파싱
        const endTimeStr = session.endTime.toTimeString().slice(0, 5); // "HH:MM" 형식
        const [hours, minutes] = endTimeStr.split(':').map(Number);
        sessionEndTime.setHours(hours, minutes, 0, 0);

        // KST로 변환
        const kstSessionEndTime = new Date(
          sessionEndTime.getTime() + 9 * 60 * 60 * 1000,
        );

        // 아직 기간이 지나지 않은 세션만 포함 (현재 시간이 세션 종료 시간보다 이전)
        if (kstNow < kstSessionEndTime) {
          // enrollmentCount와 confirmedCount 계산
          const enrollmentCount = session.enrollments.length; // 실제 enrollment 개수
          const confirmedCount = session.enrollments.filter(
            (enrollment) => enrollment.status === 'CONFIRMED',
          ).length;

          allSessions.push({
            id: session.id,
            classId: session.classId,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            sessionSummary: session.sessionSummary,
            maxStudents: session.maxStudents,
            currentStudents: session.currentStudents,
            enrollmentCount,
            confirmedCount,
            class: {
              id: classItem.id,
              className: classItem.className,
              level: classItem.level,
              tuitionFee: classItem.tuitionFee,
              teacher: classItem.teacher,
            },
          });
        }
      }
    }

    return allSessions;
  }

  // Principal의 세션 수강생 조회
  async getPrincipalSessionEnrollments(sessionId: number, principalId: number) {
    // Principal이 해당 세션에 접근할 권한이 있는지 확인
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            classes: {
              include: {
                classSessions: {
                  where: { id: sessionId },
                },
              },
            },
          },
        },
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 세션이 Principal의 학원에 속하는지 확인
    const sessionExists = principal.academy.classes.some((classItem) =>
      classItem.classSessions.some((session) => session.id === sessionId),
    );

    if (!sessionExists) {
      throw new ForbiddenException('해당 세션에 접근할 권한이 없습니다.');
    }

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
      },
      orderBy: { enrolledAt: 'asc' },
    });

    // 상태별 카운트 계산
    const statusCounts = enrollments.reduce(
      (acc, enrollment) => {
        acc[enrollment.status] = (acc[enrollment.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      session: {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        sessionSummary: session.sessionSummary,
        class: {
          id: session.class.id,
          className: session.class.className,
          level: session.class.level,
          tuitionFee: session.class.tuitionFee,
          teacher: session.class.teacher,
        },
      },
      enrollments,
      totalCount: enrollments.length,
      statusCounts,
    };
  }

  // Principal의 수강 신청 대기 세션 목록 조회
  async getPrincipalSessionsWithEnrollmentRequests(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    const sessions = await this.prisma.classSession.findMany({
      where: {
        class: {
          academyId: principal.academyId,
        },
        enrollments: {
          some: {
            status: 'PENDING',
          },
        },
      },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            level: true,
          },
        },
        enrollments: {
          where: {
            status: 'PENDING',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      className: session.class.className,
      sessionDate: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      requestCount: session.enrollments.length,
      class: {
        level: session.class.level,
      },
    }));
  }

  // Principal의 특정 세션 수강 신청 요청 목록 조회
  async getPrincipalSessionEnrollmentRequests(
    sessionId: number,
    principalId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 세션이 Principal의 학원에 속하는지 확인
    const session = await this.prisma.classSession.findFirst({
      where: {
        id: sessionId,
        class: {
          academyId: principal.academyId,
        },
      },
    });

    if (!session) {
      throw new ForbiddenException('해당 세션에 접근할 권한이 없습니다.');
    }

    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        sessionId,
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        session: {
          include: {
            class: {
              select: {
                id: true,
                className: true,
                level: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    return enrollments;
  }

  // Principal이 수강 신청 승인
  async approveEnrollmentByPrincipal(
    enrollmentId: number,
    principalId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 enrollment가 Principal의 학원에 속하는지 확인
    const enrollment = await this.prisma.sessionEnrollment.findFirst({
      where: {
        id: enrollmentId,
        session: {
          class: {
            academyId: principal.academyId,
          },
        },
      },
      include: {
        session: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('해당 수강 신청에 접근할 권한이 없습니다.');
    }

    if (enrollment.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 수강 신청입니다.');
    }

    // 수강 신청 승인 및 Payment 상태 업데이트 (트랜잭션)
    const updatedEnrollment = await this.prisma.$transaction(async (tx) => {
      // SessionEnrollment 상태 업데이트
      const enrollment = await tx.sessionEnrollment.update({
        where: { id: enrollmentId },
        data: { status: 'CONFIRMED' },
        include: {
          student: true,
          session: {
            include: {
              class: true,
            },
          },
        },
      });

      // Payment 상태를 PENDING → COMPLETED로 변경
      await tx.payment
        .update({
          where: { sessionEnrollmentId: enrollmentId },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        })
        .catch(() => {
          // Payment가 없는 경우 무시 (기존 데이터 호환성)
          console.warn(
            `Payment not found for enrollment ${enrollmentId}, skipping payment update`,
          );
        });

      // Attendance 레코드 생성 (기본 상태: ABSENT)
      const sessionDate = new Date(enrollment.session.date);
      await (tx as any).attendance
        .create({
          data: {
            sessionEnrollmentId: enrollmentId,
            classId: enrollment.session.classId,
            studentId: enrollment.studentId,
            date: sessionDate,
            status: 'ABSENT',
          },
        })
        .catch(() => {
          // 이미 Attendance 레코드가 있는 경우 무시
          console.warn(
            `Attendance already exists for enrollment ${enrollmentId}, skipping attendance creation`,
          );
        });

      return enrollment;
    });

    // 세션 현재 학생 수 증가 (PENDING -> CONFIRMED)
    await this.updateSessionCurrentStudents(
      enrollment.sessionId,
      'PENDING',
      'CONFIRMED',
      enrollmentId,
    );

    // 소켓 알림: 수강신청 승인
    try {
      // Student의 userRefId 조회
      const student = await this.prisma.student.findUnique({
        where: { id: updatedEnrollment.studentId },
        select: { userRefId: true },
      });

      if (student) {
        this.socketGateway.notifyEnrollmentAccepted(
          updatedEnrollment.id,
          student.userRefId,
          updatedEnrollment.sessionId,
        );
      }
    } catch (e) {
      // 소켓 알림 실패는 비핵심 경로이므로 로깅만 수행
      console.warn('Socket notifyEnrollmentAccepted failed:', e);
    }

    return updatedEnrollment;
  }

  // Principal이 수강 신청 거절
  async rejectEnrollmentByPrincipal(
    enrollmentId: number,
    rejectData: { reason: string; detailedReason?: string },
    principalId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 enrollment가 Principal의 학원에 속하는지 확인
    const enrollment = await this.prisma.sessionEnrollment.findFirst({
      where: {
        id: enrollmentId,
        session: {
          class: {
            academyId: principal.academyId,
          },
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('해당 수강 신청에 접근할 권한이 없습니다.');
    }

    if (enrollment.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 수강 신청입니다.');
    }

    // Principal 정보를 User 테이블에서 찾거나 생성
    let user = await this.prisma.user.findUnique({
      where: { userId: principal.userId },
    });

    if (!user) {
      // Principal 정보를 User 테이블에 추가
      user = await this.prisma.user.create({
        data: {
          userId: principal.userId,
          password: principal.password,
          name: principal.name,
          role: 'PRINCIPAL',
        },
      });
    }

    // 트랜잭션으로 수강 신청 거절 및 거절 상세 정보 생성
    const result = await this.prisma.$transaction(async (prisma) => {
      // 수강 신청 거절
      const updatedEnrollment = await prisma.sessionEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'REJECTED',
        },
        include: {
          student: true,
          session: {
            include: {
              class: true,
            },
          },
        },
      });

      // Payment 상태를 PENDING → CANCELLED로 변경
      await prisma.payment
        .update({
          where: { sessionEnrollmentId: enrollmentId },
          data: {
            status: 'CANCELLED',
          },
        })
        .catch(() => {
          // Payment가 없는 경우 무시 (기존 데이터 호환성)
          console.warn(
            `Payment not found for enrollment ${enrollmentId}, skipping payment update`,
          );
        });

      // 거절 상세 정보 생성
      await prisma.rejectionDetail.create({
        data: {
          rejectionType: 'SESSION_ENROLLMENT_REJECTION',
          entityId: enrollmentId,
          entityType: 'SessionEnrollment',
          reason: rejectData.reason,
          detailedReason: rejectData.detailedReason,
          rejectedBy: user.id,
        },
      });

      return updatedEnrollment;
    });

    // 소켓 알림: 수강신청 거절
    try {
      // Student의 userRefId 조회
      const student = await this.prisma.student.findUnique({
        where: { id: result.studentId },
        select: { userRefId: true },
      });

      if (student) {
        this.socketGateway.notifyEnrollmentRejected(
          result.id,
          student.userRefId,
          result.sessionId,
        );
      }
    } catch (e) {
      console.warn('Socket notifyEnrollmentRejected failed:', e);
    }

    return result;
  }
}

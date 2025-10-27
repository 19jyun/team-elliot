import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { AcademyService } from '../academy/academy.service';
import { JoinAcademyDto } from './dto/join-academy.dto';
import { LeaveAcademyDto } from './dto/leave-academy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRefundAccountDto } from './dto/update-refund-account.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
    private academyService: AcademyService,
  ) {}

  async getStudentClasses(userId: number) {
    // userRefId를 사용하여 student 정보 조회
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      include: {
        enrollments: {
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
          },
        },
        sessionEnrollments: {
          include: {
            session: {
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
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    // 활성 상태의 수강 신청만 필터링 (수강 중인 클래스)
    const activeEnrollmentStatuses = [
      'PENDING',
      'CONFIRMED',
      'REFUND_REQUESTED',
      'REFUND_REJECTED_CONFIRMED',
    ];

    const activeEnrollments = student.sessionEnrollments.filter((enrollment) =>
      activeEnrollmentStatuses.includes(enrollment.status),
    );

    // Get unique classes where student has active enrollments
    const enrolledClassIds = new Set(
      activeEnrollments.map((enrollment) => enrollment.session.class.id),
    );

    const enrollmentClasses = Array.from(enrolledClassIds).map((classId) => {
      const enrollment = activeEnrollments.find(
        (e) => e.session.class.id === classId,
      );
      return enrollment.session.class;
    });

    // 1. KST 기준 오늘 날짜 추출
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 2. 시작일: 현재 월의 1일 (KST 기준)
    const startDate = new Date(kstNow.getFullYear(), kstNow.getMonth(), 1);

    // 3. 종료일: 3개월 후의 마지막 날 (KST 기준)
    const threeMonthEnd = new Date(
      kstNow.getFullYear(),
      kstNow.getMonth() + 3,
      0,
    );

    // 4. 유저 세션 중 가장 마지막 날짜 구하기 (KST 변환)
    let latestSessionDate: Date | null = null;
    if (activeEnrollments.length > 0) {
      latestSessionDate = new Date(
        Math.max(
          ...activeEnrollments.map((e) => {
            const sessionDate = new Date(e.session.date);
            return sessionDate.getTime() + 9 * 60 * 60 * 1000;
          }),
        ),
      );
    }

    // 5. 종료일 결정: 3개월 뒤 or 유저 세션 마지막 날짜 중 더 나중
    let endDate = threeMonthEnd;
    if (latestSessionDate && latestSessionDate > threeMonthEnd) {
      // latestSessionDate가 속한 달의 마지막 날로 확장
      endDate = new Date(
        latestSessionDate.getFullYear(),
        latestSessionDate.getMonth() + 1,
        0,
      );
    }

    // 6. 세션 필터링: 오늘 이후(KST)만 포함
    const todayKST = new Date(
      kstNow.getFullYear(),
      kstNow.getMonth(),
      kstNow.getDate(),
    );
    const sessionClasses = activeEnrollments
      .filter((enrollment) => {
        const sessionDate = new Date(enrollment.session.date);
        const kstSessionDate = new Date(
          sessionDate.getTime() + 9 * 60 * 60 * 1000,
        );
        return kstSessionDate >= todayKST;
      })
      .map((enrollment) => ({
        ...enrollment.session,
        session_id: enrollment.session.id,
        enrollment_status: enrollment.status || 'PENDING',
        enrollment_id: enrollment.id,
      }));

    const calendarRange = {
      startDate,
      endDate,
    };

    return {
      enrollmentClasses,
      sessionClasses,
      calendarRange,
    };
  }

  async getClassDetail(classId: number) {
    const class_ = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            introduction: true,
          },
        },
        enrollments: true,
      },
    });

    if (!class_) {
      throw new NotFoundException({
        code: 'CLASS_NOT_FOUND',
        message: '수업을 찾을 수 없습니다.',
        details: { classId },
      });
    }

    return class_;
  }

  async enrollClass(classId: number, userId: number) {
    // 먼저 student 정보를 userRefId로 조회
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

    return this.classService.enrollStudent(classId, student.id);
  }

  async unenrollClass(classId: number, userId: number) {
    // 먼저 student 정보를 userRefId로 조회
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

    return this.classService.unenrollStudent(classId, student.id);
  }

  // 학원 관련 메서드들 - AcademyService 위임
  async getMyAcademies(userId: number) {
    // 먼저 student 정보를 userRefId로 조회
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

    return this.academyService.getStudentAcademies(student.id);
  }

  async joinAcademy(userId: number, joinAcademyDto: JoinAcademyDto) {
    // 먼저 student 정보를 userRefId로 조회
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

    return this.academyService.joinAcademyByStudent(student.id, joinAcademyDto);
  }

  async leaveAcademy(userId: number, leaveAcademyDto: LeaveAcademyDto) {
    // 먼저 student 정보를 userRefId로 조회
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

    return this.academyService.leaveAcademyByStudent(
      student.id,
      leaveAcademyDto,
    );
  }

  // 수강생을 학원에서 제거 (원장용)
  async removeStudentFromAcademy(
    principalTeacherId: number,
    studentId: number,
  ) {
    return this.academyService.removeStudentFromAcademyByTeacherComplete(
      principalTeacherId,
      studentId,
    );
  }

  async getMyProfile(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        emergencyContact: true,
        birthDate: true,
        notes: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return {
      id: student.id,
      userId: student.userId,
      name: student.name,
      phoneNumber: student.phoneNumber,
      emergencyContact: student.emergencyContact,
      birthDate: student.birthDate,
      notes: student.notes,
      level: student.level,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  async updateMyProfile(userId: number, updateProfileDto: UpdateProfileDto) {
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

    // 빈 문자열을 null로 변환하고 birthDate를 ISO 형식으로 변환
    const studentUpdateData = {
      name: updateProfileDto.name,
      phoneNumber: updateProfileDto.phoneNumber || null,
      emergencyContact: updateProfileDto.emergencyContact || null,
      birthDate:
        updateProfileDto.birthDate && updateProfileDto.birthDate.trim() !== ''
          ? new Date(updateProfileDto.birthDate).toISOString()
          : null,
      notes: updateProfileDto.notes || null,
      level: updateProfileDto.level || null,
      updatedAt: new Date(),
    };

    // User 테이블 업데이트 데이터 (이름이 변경된 경우에만)
    const userUpdateData = updateProfileDto.name
      ? {
          name: updateProfileDto.name,
          updatedAt: new Date(),
        }
      : null;

    // 트랜잭션으로 Student와 User 테이블 동시 업데이트
    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      // Student 테이블 업데이트
      const student = await tx.student.update({
        where: { userRefId: userId },
        data: studentUpdateData,
        select: {
          id: true,
          userId: true,
          name: true,
          phoneNumber: true,
          emergencyContact: true,
          birthDate: true,
          notes: true,
          level: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 이름이 변경된 경우 User 테이블도 업데이트
      if (userUpdateData) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      return student;
    });

    return {
      id: updatedStudent.id,
      userId: updatedStudent.userId,
      name: updatedStudent.name,
      phoneNumber: updatedStudent.phoneNumber,
      emergencyContact: updatedStudent.emergencyContact,
      birthDate: updatedStudent.birthDate,
      notes: updatedStudent.notes,
      level: updatedStudent.level,
      createdAt: updatedStudent.createdAt,
      updatedAt: updatedStudent.updatedAt,
    };
  }

  /**
   * 학생의 신청/결제 내역 조회 (session_enrollments 기반)
   */
  async getEnrollmentHistory(userId: number) {
    // 먼저 student 정보를 userRefId로 조회
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

    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        studentId: student.id,
        status: {
          in: [
            'PENDING',
            'CONFIRMED',
            'REJECTED',
            'REFUND_REQUESTED',
            'REFUND_REJECTED_CONFIRMED',
          ],
        },
      },
      include: {
        session: {
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
          },
        },
        payment: true,
        refundRequests: {
          orderBy: {
            requestedAt: 'desc',
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    // 각 enrollment에 대한 거절 사유 정보 조회
    const enrollmentsWithRejectionDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        // 수강 신청 거절 사유 조회 (REJECTED 상태인 경우)
        let enrollmentRejection = null;
        if (enrollment.status === 'REJECTED') {
          enrollmentRejection = await this.prisma.rejectionDetail.findFirst({
            where: {
              entityId: enrollment.id,
              entityType: 'SessionEnrollment',
              rejectionType: 'SESSION_ENROLLMENT_REJECTION',
            },
            include: {
              rejector: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
        }

        // 환불 요청 거절 사유 조회 (환불 요청이 있는 경우)
        let refundRejection = null;
        if (enrollment.refundRequests && enrollment.refundRequests.length > 0) {
          const latestRefundRequest = enrollment.refundRequests[0];
          if (latestRefundRequest.status === 'REJECTED') {
            refundRejection = await this.prisma.rejectionDetail.findFirst({
              where: {
                entityId: latestRefundRequest.id,
                entityType: 'RefundRequest',
                rejectionType: 'REFUND_REJECTION',
              },
              include: {
                rejector: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            });
          }
        }

        return {
          id: enrollment.id,
          sessionId: enrollment.sessionId,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          cancelledAt: enrollment.cancelledAt,
          description: `${enrollment.session.class.className} - ${enrollment.status === 'PENDING' ? '수강 신청 대기중' : enrollment.status === 'CONFIRMED' ? '수강 신청 승인됨' : enrollment.status === 'REJECTED' ? '수강 신청 거절됨' : '환불 요청됨'}`,
          session: {
            id: enrollment.session.id,
            date: enrollment.session.date,
            startTime: enrollment.session.startTime,
            endTime: enrollment.session.endTime,
            class: {
              id: enrollment.session.class.id,
              className: enrollment.session.class.className,
              level: enrollment.session.class.level,
              teacher: enrollment.session.class.teacher,
            },
          },
          payment: enrollment.payment,
          refundRequests: enrollment.refundRequests,
          // 거절 사유 정보 추가
          enrollmentRejection,
          refundRejection,
        };
      }),
    );

    return enrollmentsWithRejectionDetails;
  }

  /**
   * 학생의 환불/취소 내역 조회 (refund_requests 기반)
   */
  async getCancellationHistory(userId: number) {
    // 먼저 student 정보를 userRefId로 조회
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

    // 환불 요청 내역 조회 (단순화된 상태만)
    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        studentId: student.id,
        status: {
          in: ['REFUND_REQUESTED', 'APPROVED', 'REJECTED'],
        },
      },
      include: {
        sessionEnrollment: {
          include: {
            session: {
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
              },
            },
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    // 각 환불 요청에 대한 거절 사유 조회
    const refundRequestsWithRejectionDetails = await Promise.all(
      refundRequests.map(async (refund) => {
        let rejectionDetail = null;
        if (refund.status === 'REJECTED') {
          rejectionDetail = await this.prisma.rejectionDetail.findFirst({
            where: {
              entityId: refund.id,
              entityType: 'RefundRequest',
              rejectionType: 'REFUND_REJECTION',
            },
            include: {
              rejector: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
        }

        return {
          id: refund.id,
          sessionId: refund.sessionEnrollment.session.id,
          className: refund.sessionEnrollment.session.class.className,
          teacherName: refund.sessionEnrollment.session.class.teacher.name,
          sessionDate: refund.sessionEnrollment.session.date,
          sessionTime: refund.sessionEnrollment.session.startTime,
          refundAmount: refund.refundAmount,
          status: refund.status,
          reason: refund.reason,
          detailedReason: refund.detailedReason,
          requestedAt: refund.requestedAt,
          processedAt: refund.processedAt,
          cancelledAt: refund.cancelledAt,
          // 거절 사유 정보 추가
          rejectionDetail,
        };
      }),
    );

    return refundRequestsWithRejectionDetails;
  }

  // 세션별 입금 정보 조회 (결제 시 사용)
  async getSessionPaymentInfo(userId: number, sessionId: number) {
    // 먼저 student 정보를 userRefId로 조회
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

    // 학생이 해당 세션에 수강 신청할 권한이 있는지 확인
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            academy: {
              include: {
                principal: {
                  select: {
                    id: true,
                    name: true,
                    bankName: true,
                    accountNumber: true,
                    accountHolder: true,
                  },
                },
              },
            },
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

    // 학생이 해당 학원에 가입되어 있는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: {
          studentId: student.id,
          academyId: session.class.academy.id,
        },
      },
    });

    if (!studentAcademy) {
      throw new ForbiddenException({
        code: 'NOT_ACADEMY_MEMBER',
        message: '해당 학원에 가입되어 있지 않습니다.',
        details: {
          studentId: student.id,
          academyId: session.class.academy.id,
        },
      });
    }

    // 세션이 수강 가능한 상태인지 확인
    const now = new Date();
    const sessionDate = new Date(session.date);

    if (sessionDate < now) {
      throw new BadRequestException({
        code: 'SESSION_ALREADY_PASSED',
        message: '이미 지난 세션입니다.',
        details: {
          sessionId,
          sessionDate: sessionDate.toISOString(),
          currentDate: now.toISOString(),
        },
      });
    }

    // 이미 수강 신청한 세션인지 확인 (수강신청 불가능한 상태만 체크)
    const existingEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: {
        studentId_sessionId: {
          studentId: student.id,
          sessionId: sessionId,
        },
      },
    });

    if (existingEnrollment) {
      // 수강신청 불가능한 상태들: PENDING, CONFIRMED, REFUND_REQUESTED, TEACHER_CANCELLED, ABSENT, ATTENDED, REFUND_REJECTED_CONFIRMED
      const nonEnrollableStatuses = [
        'PENDING',
        'CONFIRMED',
        'REFUND_REQUESTED',
        'TEACHER_CANCELLED',
        'ABSENT',
        'ATTENDED',
        'REFUND_REJECTED_CONFIRMED',
      ];

      if (nonEnrollableStatuses.includes(existingEnrollment.status)) {
        throw new ConflictException({
          code: 'ALREADY_ENROLLED',
          message: '이미 수강 신청한 세션입니다.',
          details: {
            studentId: student.id,
            sessionId,
            enrollmentId: existingEnrollment.id,
            existingStatus: existingEnrollment.status,
          },
        });
      }
      // REJECTED, CANCELLED, REFUND_CANCELLED 상태는 재신청 가능하므로 계속 진행
    }

    // 입금 정보 반환
    return {
      sessionId: session.id,
      className: session.class.className,
      sessionDate: session.date,
      sessionTime: session.startTime,
      tuitionFee: Number(session.class.tuitionFee),
      principal: {
        id: session.class.academy.principal.id,
        name: session.class.academy.principal.name,
        bankName: session.class.academy.principal.bankName,
        accountNumber: session.class.academy.principal.accountNumber,
        accountHolder: session.class.academy.principal.accountHolder,
      },
    };
  }

  // Principal의 학원 모든 학생 조회
  async getPrincipalStudents(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    sessionEnrollments: {
                      include: {
                        session: {
                          include: {
                            class: true,
                          },
                        },
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
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { principalId },
      });
    }

    // 학생 정보를 평면화하여 반환
    const students = await Promise.all(
      principal.academy.students.map(async (studentAcademy) => {
        const student = studentAcademy.student;
        const activeEnrollments = student.sessionEnrollments.filter(
          (enrollment) =>
            [
              'PENDING',
              'CONFIRMED',
              'REFUND_REQUESTED',
              'REFUND_REJECTED_CONFIRMED',
            ].includes(enrollment.status),
        );

        return {
          id: student.id,
          name: student.name,
          phoneNumber: student.phoneNumber,
          level: student.level,
          joinedAt: studentAcademy.joinedAt,
          activeEnrollmentsCount: activeEnrollments.length,
        };
      }),
    );

    return students;
  }

  // Principal이 학생 제거
  async removeStudentByPrincipal(studentId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { principalId },
      });
    }

    // 해당 수강생이 Principal의 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findFirst({
      where: {
        studentId,
        academyId: principal.academyId,
      },
    });

    if (!studentAcademy) {
      throw new ForbiddenException({
        code: 'NOT_AUTHORIZED',
        message: '해당 수강생에 접근할 권한이 없습니다.',
        details: { studentId, principalId },
      });
    }

    // 수강생을 학원에서 제거
    await this.prisma.studentAcademy.delete({
      where: { id: studentAcademy.id },
    });

    return { message: '수강생이 학원에서 제거되었습니다.' };
  }

  // Principal이 학생의 세션 수강 현황 조회
  async getStudentSessionHistoryByPrincipal(
    studentId: number,
    principalId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { principalId },
      });
    }

    // 해당 수강생이 Principal의 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findFirst({
      where: {
        studentId,
        academyId: principal.academyId,
      },
    });

    if (!studentAcademy) {
      throw new ForbiddenException({
        code: 'NOT_AUTHORIZED',
        message: '해당 수강생에 접근할 권한이 없습니다.',
        details: { studentId, principalId },
      });
    }

    // 수강생의 모든 세션 수강 현황 조회
    const sessionHistory = await this.prisma.sessionEnrollment.findMany({
      where: {
        studentId,
        session: {
          class: {
            academyId: principal.academyId,
          },
        },
      },
      include: {
        session: {
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
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return sessionHistory;
  }

  async getTeacherProfile(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        phoneNumber: true,
        introduction: true,
        yearsOfExperience: true,
        education: true,
        specialties: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher;
  }

  /**
   * 학생의 환불 계좌 정보 조회
   */
  async getRefundAccount(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      select: {
        id: true,
        refundAccountHolder: true,
        refundAccountNumber: true,
        refundBankName: true,
      },
    });

    if (!student) {
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        message: '학생을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return {
      id: student.id,
      refundAccountHolder: student.refundAccountHolder,
      refundAccountNumber: student.refundAccountNumber,
      refundBankName: student.refundBankName,
    };
  }

  /**
   * 학생의 환불 계좌 정보 수정
   */
  async updateRefundAccount(
    userId: number,
    updateRefundAccountDto: UpdateRefundAccountDto,
  ) {
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

    // 빈 문자열을 null로 변환
    const updateData = {
      refundAccountHolder: updateRefundAccountDto.refundAccountHolder || null,
      refundAccountNumber: updateRefundAccountDto.refundAccountNumber || null,
      refundBankName: updateRefundAccountDto.refundBankName || null,
      updatedAt: new Date(),
    };

    const updatedStudent = await this.prisma.student.update({
      where: { userRefId: userId },
      data: updateData,
      select: {
        id: true,
        refundAccountHolder: true,
        refundAccountNumber: true,
        refundBankName: true,
        updatedAt: true,
      },
    });

    return {
      id: updatedStudent.id,
      refundAccountHolder: updatedStudent.refundAccountHolder,
      refundAccountNumber: updatedStudent.refundAccountNumber,
      refundBankName: updatedStudent.refundBankName,
      updatedAt: updatedStudent.updatedAt,
    };
  }
}

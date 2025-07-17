import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { AcademyService } from '../academy/academy.service';
import { JoinAcademyDto } from './dto/join-academy.dto';
import { LeaveAcademyDto } from './dto/leave-academy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
    private academyService: AcademyService,
  ) {}

  async getStudentClasses(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
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
      throw new NotFoundException('학생을 찾을 수 없습니다.');
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

    // Get individual sessions with session_id and status (활성 상태만)
    const sessionClasses = activeEnrollments.map((enrollment) => ({
      ...enrollment.session,
      session_id: enrollment.session.id,
      enrollment_status: enrollment.status || 'PENDING',
      enrollment_id: enrollment.id,
    }));

    // 캘린더 범위 계산 (학생의 수강 기간)
    let calendarRange = null;

    if (sessionClasses.length > 0) {
      const sessionDates = sessionClasses.map(
        (session) => new Date(session.date),
      );
      const earliestDate = new Date(
        Math.min(...sessionDates.map((d) => d.getTime())),
      );
      const latestDate = new Date(
        Math.max(...sessionDates.map((d) => d.getTime())),
      );

      // 시작일을 해당 월의 1일로, 종료일을 해당 월의 마지막 날로 설정
      const rangeStartDate = new Date(
        earliestDate.getFullYear(),
        earliestDate.getMonth(),
        1,
      );
      const rangeEndDate = new Date(
        latestDate.getFullYear(),
        latestDate.getMonth() + 1,
        0,
      );

      // 최소 3개월 범위 보장
      const minEndDate = new Date(
        rangeStartDate.getFullYear(),
        rangeStartDate.getMonth() + 2,
        0,
      );
      const finalEndDate =
        rangeEndDate > minEndDate ? rangeEndDate : minEndDate;

      calendarRange = {
        startDate: rangeStartDate,
        endDate: finalEndDate,
      };
    }

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
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    return class_;
  }

  async enrollClass(classId: number, studentId: number) {
    return this.classService.enrollStudent(classId, studentId);
  }

  async unenrollClass(classId: number, studentId: number) {
    return this.classService.unenrollStudent(classId, studentId);
  }

  // 학원 관련 메서드들 - AcademyService 위임
  async getMyAcademies(studentId: number) {
    return this.academyService.getMyAcademies(studentId);
  }

  async joinAcademy(studentId: number, joinAcademyDto: JoinAcademyDto) {
    return this.academyService.joinAcademy(studentId, joinAcademyDto);
  }

  async leaveAcademy(studentId: number, leaveAcademyDto: LeaveAcademyDto) {
    return this.academyService.leaveAcademy(studentId, leaveAcademyDto);
  }

  async getMyProfile(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
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
      throw new NotFoundException('학생을 찾을 수 없습니다.');
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

  async updateMyProfile(studentId: number, updateProfileDto: UpdateProfileDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // 빈 문자열을 null로 변환하고 birthDate를 ISO 형식으로 변환
    const updateData = {
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

    const updatedStudent = await this.prisma.student.update({
      where: { id: studentId },
      data: updateData,
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
  async getEnrollmentHistory(studentId: number) {
    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        studentId: studentId,
        status: {
          in: [
            'PENDING',
            'CONFIRMED',
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

    // 각 enrollment에 대한 환불 거절 사유 정보 조회
    const enrollmentsWithRejectionDetails = await Promise.all(
      enrollments.map(async (enrollment) => {
        // 환불 요청 거절 사유 조회 (환불 요청이 있는 경우)
        let refundRejection = null;
        if (enrollment.refundRequests && enrollment.refundRequests.length > 0) {
          const latestRefundRequest = enrollment.refundRequests[0];
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

        return {
          id: enrollment.id,
          sessionId: enrollment.sessionId,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          cancelledAt: enrollment.cancelledAt,
          description: `${enrollment.session.class.className} - ${enrollment.status === 'PENDING' ? '수강 신청 대기중' : enrollment.status === 'CONFIRMED' ? '수강 신청 승인됨' : enrollment.status === 'REFUND_REQUESTED' ? '환불 요청됨' : '환불 거절됨'}`,
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
          // 환불 거절 사유 정보 추가
          refundRejection,
        };
      }),
    );

    return enrollmentsWithRejectionDetails;
  }

  /**
   * 학생의 환불/취소 내역 조회 (session_enrollments 기반)
   */
  async getCancellationHistory(studentId: number) {
    const enrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        studentId: studentId,
        status: {
          in: [
            'REJECTED',
            'REFUND_CANCELLED',
            'REFUND_REQUESTED',
            'CANCELLED',
            'TEACHER_CANCELLED',
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
        // 수강 신청 거절 사유 조회
        const enrollmentRejection = await this.prisma.rejectionDetail.findFirst(
          {
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
          },
        );

        // 환불 요청 거절 사유 조회 (환불 요청이 있는 경우)
        let refundRejection = null;
        if (enrollment.refundRequests && enrollment.refundRequests.length > 0) {
          const latestRefundRequest = enrollment.refundRequests[0];
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

        return {
          id: enrollment.id,
          sessionId: enrollment.sessionId,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          cancelledAt: enrollment.cancelledAt,
          rejectedAt: enrollment.rejectedAt,
          description: `${enrollment.session.class.className} - ${enrollment.status === 'REJECTED' ? '거절됨' : enrollment.status === 'REFUND_CANCELLED' ? '환불완료' : enrollment.status === 'REFUND_REQUESTED' ? '환불대기' : enrollment.status === 'CANCELLED' ? '학생취소' : '선생님취소'}`,
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
}

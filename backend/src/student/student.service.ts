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

    let calendarRange = {
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

  // 수강생을 학원에서 제거 (관리자용)
  async removeStudentFromAcademy(adminTeacherId: number, studentId: number) {
    // 권한 확인
    const adminTeacher = await this.prisma.teacher.findUnique({
      where: { id: adminTeacherId },
      include: {
        academy: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!adminTeacher?.academy) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    const isAdmin = adminTeacher.academy.admins.some(
      (admin) => admin.teacherId === adminTeacherId,
    );
    if (!isAdmin) {
      throw new ForbiddenException('학원 관리 권한이 없습니다.');
    }

    // 수강생이 해당 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: {
          studentId: studentId,
          academyId: adminTeacher.academy.id,
        },
      },
    });

    if (!studentAcademy) {
      throw new NotFoundException('해당 수강생을 찾을 수 없습니다.');
    }

    // 수강생의 모든 세션 수강 내역과 관련 데이터 삭제
    await this.prisma.$transaction(async (tx) => {
      // 1. 수강생의 세션 수강 신청 내역 삭제
      await tx.sessionEnrollment.deleteMany({
        where: {
          studentId: studentId,
          session: {
            class: {
              academyId: adminTeacher.academy.id,
            },
          },
        },
      });

      // 2. 수강생의 클래스 수강 신청 내역 삭제
      await tx.enrollment.deleteMany({
        where: {
          studentId: studentId,
          class: {
            academyId: adminTeacher.academy.id,
          },
        },
      });

      // 3. 수강생의 출석 기록 삭제
      await tx.attendance.deleteMany({
        where: {
          studentId: studentId,
          class: {
            academyId: adminTeacher.academy.id,
          },
        },
      });

      // 4. 수강생의 결제 내역 삭제
      await tx.payment.deleteMany({
        where: {
          studentId: studentId,
          sessionEnrollment: {
            session: {
              class: {
                academyId: adminTeacher.academy.id,
              },
            },
          },
        },
      });

      // 5. 수강생의 환불 요청 내역 삭제
      await tx.refundRequest.deleteMany({
        where: {
          studentId: studentId,
          sessionEnrollment: {
            session: {
              class: {
                academyId: adminTeacher.academy.id,
              },
            },
          },
        },
      });

      // 6. 수강생을 학원에서 제거
      await tx.studentAcademy.delete({
        where: {
          studentId_academyId: {
            studentId: studentId,
            academyId: adminTeacher.academy.id,
          },
        },
      });
    });

    return { message: '수강생이 학원에서 제거되었습니다.' };
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

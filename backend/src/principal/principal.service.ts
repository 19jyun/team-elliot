import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class PrincipalService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  // Principal의 학원 정보 조회
  async getMyAcademy(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            teachers: {
              include: {
                classes: true,
              },
            },
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
            students: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    return principal.academy;
  }

  // Principal의 학원 모든 세션 조회
  async getAllSessions(principalId: number) {
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
            maxStudents: session.maxStudents,
            currentStudents: session.currentStudents,
            enrollmentCount,
            confirmedCount,
            class: {
              id: classItem.id,
              className: classItem.className,
              level: classItem.level,
              teacher: classItem.teacher,
            },
          });
        }
      }
    }

    return allSessions;
  }

  // Principal의 학원 모든 클래스 조회
  async getAllClasses(principalId: number) {
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

    return principal.academy.classes;
  }

  // Principal의 학원 모든 강사 조회
  async getAllTeachers(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            teachers: {
              include: {
                classes: {
                  include: {
                    classSessions: true,
                  },
                },
              },
            },
            principal: true,
          },
        },
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    return principal.academy.teachers;
  }

  // Principal의 학원 모든 학생 조회
  async getAllStudents(principalId: number) {
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
      throw new NotFoundException('Principal not found');
    }

    // 각 수강생의 수강 통계 계산
    const studentsWithStats = await Promise.all(
      principal.academy.students.map(async (studentAcademy) => {
        const enrollments = await this.prisma.sessionEnrollment.findMany({
          where: {
            studentId: studentAcademy.studentId,
            session: {
              class: {
                academyId: principal.academyId,
              },
            },
          },
        });

        const totalSessions = enrollments.length;
        const confirmedSessions = enrollments.filter(
          (e) => e.status === 'CONFIRMED',
        ).length;
        const pendingSessions = enrollments.filter(
          (e) => e.status === 'PENDING',
        ).length;

        return {
          ...studentAcademy.student,
          joinedAt: studentAcademy.joinedAt,
          totalSessions,
          confirmedSessions,
          pendingSessions,
        };
      }),
    );

    return studentsWithStats;
  }

  // Principal의 학원 모든 수강신청 조회 (Redux store용)
  async getAllEnrollments(principalId: number) {
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
          },
        },
        session: {
          include: {
            class: {
              select: {
                id: true,
                className: true,
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

  // Principal의 학원 모든 환불요청 조회 (Redux store용)
  async getAllRefundRequests(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        sessionEnrollment: {
          session: {
            class: {
              academyId: principal.academyId,
            },
          },
        },
      },
      include: {
        sessionEnrollment: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
            session: {
              include: {
                class: {
                  select: {
                    className: true,
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
        },
        processor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return refundRequests;
  }

  // Principal 정보 조회
  async getPrincipalInfo(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: true,
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    return principal;
  }

  // Principal의 은행 정보 조회 (학생이 결제 시 사용)
  async getPrincipalBankInfo(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      select: {
        id: true,
        name: true,
        bankName: true,
        accountNumber: true,
        accountHolder: true,
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    return {
      principalId: principal.id,
      principalName: principal.name,
      bankName: principal.bankName,
      accountNumber: principal.accountNumber,
      accountHolder: principal.accountHolder,
    };
  }

  // Principal 전체 데이터 조회 (Redux 초기화용)
  async getPrincipalData(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            teachers: {
              include: {
                classes: true,
              },
            },
            classes: {
              include: {
                teacher: true,
                classSessions: {
                  include: {
                    enrollments: {
                      include: {
                        student: true,
                        payment: true,
                        refundRequests: {
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
            students: {
              include: {
                student: true,
              },
            },
          },
        },
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // Redux store에 맞는 형태로 데이터 구성
    return {
      userProfile: {
        id: principal.id,
        userId: principal.userId,
        name: principal.name,
        email: principal.email,
        phoneNumber: principal.phoneNumber,
        introduction: principal.introduction,
        education: principal.education,
        certifications: principal.certifications,
        photoUrl: principal.photoUrl,
        academy: principal.academy,
        createdAt: principal.createdAt,
        updatedAt: principal.updatedAt,
      },
      academy: principal.academy,
      enrollments: principal.academy.classes.flatMap((cls) =>
        cls.classSessions.flatMap((session) =>
          session.enrollments.map((enrollment) => ({
            ...enrollment,
            session: {
              id: session.id,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              class: {
                id: cls.id,
                className: cls.className,
                teacher: {
                  name: cls.teacher.name,
                },
              },
            },
          })),
        ),
      ),
      refundRequests: principal.academy.classes.flatMap((cls) =>
        cls.classSessions.flatMap((session) =>
          session.enrollments.flatMap((enrollment) =>
            enrollment.refundRequests.map((refund) => ({
              ...refund,
              sessionEnrollment: {
                session: {
                  id: session.id,
                  date: session.date,
                  startTime: session.startTime,
                  endTime: session.endTime,
                  class: {
                    id: cls.id,
                    className: cls.className,
                    teacher: {
                      name: cls.teacher.name,
                    },
                  },
                },
                date: session.date,
                startTime: session.startTime,
                endTime: session.endTime,
              },
            })),
          ),
        ),
      ),
      classes: principal.academy.classes.map((cls) => ({
        id: cls.id,
        className: cls.className,
        classCode: cls.classCode,
        description: cls.description,
        maxStudents: cls.maxStudents,
        tuitionFee: cls.tuitionFee,
        teacherId: cls.teacherId,
        academyId: cls.academyId,
        dayOfWeek: cls.dayOfWeek,
        startTime: cls.startTime,
        endTime: cls.endTime,
        level: cls.level,
        status: cls.status,
        startDate: cls.startDate,
        endDate: cls.endDate,
        backgroundColor: cls.backgroundColor,
        teacher: {
          id: cls.teacher.id,
          name: cls.teacher.name,
          phoneNumber: cls.teacher.phoneNumber,
          introduction: cls.teacher.introduction,
          photoUrl: cls.teacher.photoUrl,
        },
        academy: {
          id: principal.academy.id,
          name: principal.academy.name,
        },
        classSessions: cls.classSessions.map((session) => ({
          id: session.id,
          classId: session.classId,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          currentStudents: session.enrollments.length,
          maxStudents: cls.maxStudents,
          enrollments: session.enrollments.map((enrollment) => ({
            id: enrollment.id,
            studentId: enrollment.studentId,
            sessionId: enrollment.sessionId,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            student: {
              id: enrollment.student.id,
              name: enrollment.student.name,
              phoneNumber: enrollment.student.phoneNumber,
            },
          })),
        })),
      })),
      teachers: principal.academy.teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        phoneNumber: teacher.phoneNumber,
        introduction: teacher.introduction,
        photoUrl: teacher.photoUrl,
      })),
      students: principal.academy.students.map((student) => ({
        id: student.student.id,
        name: student.student.name,
        phoneNumber: student.student.phoneNumber,
      })),
    };
  }

  // Principal 프로필 정보 수정
  async updateProfile(
    principalId: number,
    updateProfileDto: any,
    photo?: Express.Multer.File,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};

    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name;
    }

    if (updateProfileDto.phoneNumber !== undefined) {
      updateData.phoneNumber = updateProfileDto.phoneNumber;
    }

    if (updateProfileDto.introduction !== undefined) {
      updateData.introduction = updateProfileDto.introduction;
    }

    if (updateProfileDto.education !== undefined) {
      updateData.education = updateProfileDto.education;
    }

    if (updateProfileDto.certifications !== undefined) {
      updateData.certifications = updateProfileDto.certifications;
    }

    // 은행 정보 업데이트 로직 추가
    if (updateProfileDto.bankName !== undefined) {
      updateData.bankName = updateProfileDto.bankName;
    }

    if (updateProfileDto.accountNumber !== undefined) {
      updateData.accountNumber = updateProfileDto.accountNumber;
    }

    if (updateProfileDto.accountHolder !== undefined) {
      updateData.accountHolder = updateProfileDto.accountHolder;
    }

    // 사진이 업로드된 경우 URL 생성
    if (photo) {
      updateData.photoUrl = `/uploads/principal-photos/${photo.filename}`;
    }

    // Principal 정보 업데이트
    const updatedPrincipal = await this.prisma.principal.update({
      where: { id: principalId },
      data: updateData,
      include: {
        academy: true,
      },
    });

    return updatedPrincipal;
  }

  // Principal 프로필 사진 업데이트
  async updateProfilePhoto(principalId: number, photo: Express.Multer.File) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 사진 URL 생성
    const photoUrl = `/uploads/principal-photos/${photo.filename}`;

    // Principal 사진 업데이트
    const updatedPrincipal = await this.prisma.principal.update({
      where: { id: principalId },
      data: { photoUrl },
      include: {
        academy: true,
      },
    });

    return updatedPrincipal;
  }

  // Principal의 세션 수강생 조회
  async getSessionEnrollments(sessionId: number, principalId: number) {
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
      enrollments,
      totalCount: enrollments.length,
      statusCounts,
    };
  }

  // Principal의 학원 정보 수정
  async updateAcademy(principalId: number, updateAcademyDto: UpdateAcademyDto) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 학원 정보 업데이트
    const updatedAcademy = await this.prisma.academy.update({
      where: { id: principal.academyId },
      data: {
        name: updateAcademyDto.name,
        phoneNumber: updateAcademyDto.phoneNumber,
        address: updateAcademyDto.address,
        description: updateAcademyDto.description,
      },
    });

    return updatedAcademy;
  }

  // === 수강 신청/환불 신청 관리 메소드들 ===

  // Principal의 수강 신청 대기 세션 목록 조회
  async getSessionsWithEnrollmentRequests(principalId: number) {
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

  // Principal의 환불 요청 대기 세션 목록 조회
  async getSessionsWithRefundRequests(principalId: number) {
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
            status: 'REFUND_REQUESTED',
            refundRequests: {
              some: {
                status: 'PENDING',
              },
            },
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
            status: 'REFUND_REQUESTED',
            refundRequests: {
              some: {
                status: 'PENDING',
              },
            },
          },
          include: {
            refundRequests: {
              where: {
                status: 'PENDING',
              },
              select: {
                id: true,
              },
            },
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
      requestCount: session.enrollments.reduce(
        (total, enrollment) => total + enrollment.refundRequests.length,
        0,
      ),
      class: {
        level: session.class.level,
      },
    }));
  }

  // 특정 세션의 수강 신청 요청 목록 조회
  async getSessionEnrollmentRequests(sessionId: number, principalId: number) {
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

  // 특정 세션의 환불 요청 목록 조회
  async getSessionRefundRequests(sessionId: number, principalId: number) {
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

    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        sessionEnrollment: {
          sessionId,
          status: 'REFUND_REQUESTED',
        },
        status: 'PENDING',
      },
      include: {
        sessionEnrollment: {
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
        },
      },
      orderBy: {
        requestedAt: 'asc',
      },
    });

    return refundRequests;
  }

  // 수강 신청 승인
  async approveEnrollment(enrollmentId: number, principalId: number) {
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

    // 수강 신청 승인
    const updatedEnrollment = await this.prisma.sessionEnrollment.update({
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

    // Socket 이벤트 전송
    this.socketGateway.notifyEnrollmentStatusChange(
      enrollmentId,
      'CONFIRMED',
      updatedEnrollment,
    );

    return updatedEnrollment;
  }

  // 수강 신청 거절
  async rejectEnrollment(
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

    // 수강 신청 거절
    const updatedEnrollment = await this.prisma.sessionEnrollment.update({
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

    // Socket 이벤트 전송
    this.socketGateway.notifyEnrollmentStatusChange(
      enrollmentId,
      'REJECTED',
      updatedEnrollment,
    );

    return updatedEnrollment;
  }

  // 환불 요청 승인
  async approveRefund(refundId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 환불 요청이 Principal의 학원에 속하는지 확인
    const refundRequest = await this.prisma.refundRequest.findFirst({
      where: {
        id: refundId,
        sessionEnrollment: {
          session: {
            class: {
              academyId: principal.academyId,
            },
          },
        },
      },
    });

    if (!refundRequest) {
      throw new ForbiddenException('해당 환불 요청에 접근할 권한이 없습니다.');
    }

    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 환불 요청입니다.');
    }

    // 환불 요청 승인
    const updatedRefundRequest = await this.prisma.refundRequest.update({
      where: { id: refundId },
      data: { status: 'APPROVED' },
      include: {
        sessionEnrollment: {
          include: {
            student: true,
            session: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });

    // Socket 이벤트 전송
    this.socketGateway.notifyRefundRequestStatusChange(
      refundId,
      'APPROVED',
      updatedRefundRequest,
    );

    return updatedRefundRequest;
  }

  // 환불 요청 거절
  async rejectRefund(
    refundId: number,
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

    // 해당 환불 요청이 Principal의 학원에 속하는지 확인
    const refundRequest = await this.prisma.refundRequest.findFirst({
      where: {
        id: refundId,
        sessionEnrollment: {
          session: {
            class: {
              academyId: principal.academyId,
            },
          },
        },
      },
    });

    if (!refundRequest) {
      throw new ForbiddenException('해당 환불 요청에 접근할 권한이 없습니다.');
    }

    if (refundRequest.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 환불 요청입니다.');
    }

    // 환불 요청 거절
    const updatedRefundRequest = await this.prisma.refundRequest.update({
      where: { id: refundId },
      data: {
        status: 'REJECTED',
      },
      include: {
        sessionEnrollment: {
          include: {
            student: true,
            session: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });

    // Socket 이벤트 전송
    this.socketGateway.notifyRefundRequestStatusChange(
      refundId,
      'REJECTED',
      updatedRefundRequest,
    );

    return updatedRefundRequest;
  }

  // === 선생님/수강생 관리 메소드들 ===

  // 선생님을 학원에서 제거
  async removeTeacher(teacherId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 선생님이 Principal의 학원에 속하는지 확인
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: teacherId,
        academyId: principal.academyId,
      },
    });

    if (!teacher) {
      throw new ForbiddenException('해당 선생님에 접근할 권한이 없습니다.');
    }

    // Principal은 제거할 수 없음
    if (teacherId === principal.id) {
      throw new ForbiddenException('Principal은 제거할 수 없습니다.');
    }

    // 선생님을 학원에서 제거
    await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { academyId: null },
    });

    return { message: '선생님이 학원에서 제거되었습니다.' };
  }

  // 수강생을 학원에서 제거
  async removeStudent(studentId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 수강생이 Principal의 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findFirst({
      where: {
        studentId,
        academyId: principal.academyId,
      },
    });

    if (!studentAcademy) {
      throw new ForbiddenException('해당 수강생에 접근할 권한이 없습니다.');
    }

    // 수강생을 학원에서 제거
    await this.prisma.studentAcademy.delete({
      where: { id: studentAcademy.id },
    });

    return { message: '수강생이 학원에서 제거되었습니다.' };
  }

  // 수강생의 세션 수강 현황 조회
  async getStudentSessionHistory(studentId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 수강생이 Principal의 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findFirst({
      where: {
        studentId,
        academyId: principal.academyId,
      },
    });

    if (!studentAcademy) {
      throw new ForbiddenException('해당 수강생에 접근할 권한이 없습니다.');
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
}

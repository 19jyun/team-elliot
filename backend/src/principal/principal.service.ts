import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SocketGateway } from '../socket/socket.gateway';
import { ClassService } from '../class/class.service';
import { ClassSessionService } from '../class-session/class-session.service';
import { RefundService } from '../refund/refund.service';
import { TeacherService } from '../teacher/teacher.service';
import { StudentService } from '../student/student.service';

@Injectable()
export class PrincipalService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private classService: ClassService,
    private classSessionService: ClassSessionService,
    private refundService: RefundService,
    private teacherService: TeacherService,
    private studentService: StudentService,
  ) {}

  // Principal의 학원 정보 조회
  async getMyAcademy(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
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
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return principal.academy;
  }

  // Principal의 학원 모든 세션 조회
  async getAllSessions(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classSessionService.getPrincipalSessions(principal.id);
  }

  // Principal의 학원 모든 클래스 조회
  async getAllClasses(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classService.getPrincipalClasses(principal.id);
  }

  // Principal의 학원 모든 강사 조회
  async getAllTeachers(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.teacherService.getPrincipalTeachers(principal.id);
  }

  // Principal의 학원 모든 학생 조회
  async getAllStudents(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.studentService.getPrincipalStudents(principal.id);
  }

  // Principal의 학원 모든 수강신청 조회 (Redux store용)
  async getAllEnrollments(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classSessionService.getPrincipalEnrollments(principal.id);
  }

  // Principal의 학원 모든 환불요청 조회 (Redux store용)
  async getAllRefundRequests(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.refundService.getPrincipalRefundRequests(principal.id);
  }

  // Principal 정보 조회
  async getPrincipalInfo(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: {
        user: true,
        academy: true,
      },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return principal;
  }

  // Principal의 은행 정보 조회 (학생이 결제 시 사용)
  async getPrincipalBankInfo(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      select: {
        id: true,
        name: true,
        bankName: true,
        accountNumber: true,
        accountHolder: true,
      },
    });

    if (!principal) {
      throw new NotFoundException('Principal을 찾을 수 없습니다.');
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
  async getPrincipalData(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
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
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
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
    userId: number,
    updateProfileDto: UpdateProfileDto,
    photo?: Express.Multer.File,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException('Principal을 찾을 수 없습니다.');
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

    // User 테이블 업데이트 데이터 (이름이 변경된 경우에만)
    const userUpdateData = updateProfileDto.name
      ? {
          name: updateProfileDto.name,
          updatedAt: new Date(),
        }
      : null;

    // 트랜잭션으로 Principal과 User 테이블 동시 업데이트
    const updatedPrincipal = await this.prisma.$transaction(async (tx) => {
      // Principal 테이블 업데이트
      const updatedPrincipalData = await tx.principal.update({
        where: { id: principal.id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          academy: true,
        },
      });

      // 이름이 변경된 경우 User 테이블도 업데이트
      if (userUpdateData) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      return updatedPrincipalData;
    });

    return updatedPrincipal;
  }

  // Principal 프로필 사진 업데이트
  async updateProfilePhoto(userId: number, photo: Express.Multer.File) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException('Principal을 찾을 수 없습니다.');
    }

    // 사진 URL 생성
    const photoUrl = `/uploads/principal-photos/${photo.filename}`;

    // Principal 사진 업데이트
    const updatedPrincipal = await this.prisma.principal.update({
      where: { id: principal.id },
      data: { photoUrl },
      include: {
        academy: true,
      },
    });

    return updatedPrincipal;
  }

  // Principal의 세션 수강생 조회
  async getSessionEnrollments(sessionId: number, userId: number) {
    // 먼저 principal 정보를 userRefId로 조회
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException('Principal을 찾을 수 없습니다.');
    }

    return this.classSessionService.getPrincipalSessionEnrollments(
      sessionId,
      principal.id,
    );
  }

  // Principal의 학원 정보 수정
  async updateAcademy(userId: number, updateAcademyDto: UpdateAcademyDto) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal을 찾을 수 없습니다.');
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
  async getSessionsWithEnrollmentRequests(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classSessionService.getPrincipalSessionsWithEnrollmentRequests(
      principal.id,
    );
  }

  // Principal의 환불 요청 대기 세션 목록 조회
  async getSessionsWithRefundRequests(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.refundService.getPrincipalSessionsWithRefundRequests(
      principal.id,
    );
  }

  // 특정 세션의 수강 신청 요청 목록 조회
  async getSessionEnrollmentRequests(sessionId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classSessionService.getPrincipalSessionEnrollmentRequests(
      sessionId,
      principal.id,
    );
  }

  // 특정 세션의 환불 요청 목록 조회
  async getSessionRefundRequests(sessionId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.refundService.getPrincipalSessionRefundRequests(
      sessionId,
      userId,
    );
  }

  // 수강 신청 승인
  async approveEnrollment(enrollmentId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classSessionService.approveEnrollmentByPrincipal(
      enrollmentId,
      principal.id,
    );
  }

  // 수강 신청 거절
  async rejectEnrollment(
    enrollmentId: number,
    rejectData: { reason: string; detailedReason?: string },
    userId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.classSessionService.rejectEnrollmentByPrincipal(
      enrollmentId,
      rejectData,
      principal.id,
    );
  }

  // 환불 요청 승인
  async approveRefund(refundId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.refundService.approveRefundByPrincipal(refundId, userId);
  }

  // 환불 요청 거절
  async rejectRefund(
    refundId: number,
    rejectData: { reason: string; detailedReason?: string },
    userId: number,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.refundService.rejectRefundByPrincipal(
      refundId,
      rejectData,
      userId,
    );
  }

  // === 선생님/수강생 관리 메소드들 ===

  // 선생님을 학원에서 제거
  async removeTeacher(teacherId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.teacherService.removeTeacherByPrincipal(
      teacherId,
      principal.id,
    );
  }

  // 수강생을 학원에서 제거
  async removeStudent(studentId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.studentService.removeStudentByPrincipal(
      studentId,
      principal.id,
    );
  }

  // 수강생의 세션 수강 현황 조회
  async getStudentSessionHistory(studentId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.studentService.getStudentSessionHistoryByPrincipal(
      studentId,
      principal.id,
    );
  }

  // Principal의 학원 가입 신청 대기 선생님 목록 조회
  async getTeacherJoinRequests(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: {
          include: {
            joinRequests: {
              where: { status: 'PENDING' },
              include: {
                teacher: true,
              },
              orderBy: { createdAt: 'desc' },
            },
            teachers: {
              include: {
                classes: {
                  include: {
                    classSessions: true,
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

    // 가입 신청 대기 중인 선생님들
    const pendingRequests = principal.academy.joinRequests.map((request) => ({
      id: request.id,
      teacherId: request.teacher.id,
      teacherName: request.teacher.name,
      teacherPhoneNumber: request.teacher.phoneNumber,
      teacherIntroduction: request.teacher.introduction,
      teacherPhotoUrl: request.teacher.photoUrl,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    }));

    // 이미 가입된 선생님들
    const joinedTeachers = principal.academy.teachers.map((teacher) => ({
      id: teacher.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherPhoneNumber: teacher.phoneNumber,
      teacherIntroduction: teacher.introduction,
      teacherPhotoUrl: teacher.photoUrl,
      message: null,
      status: 'APPROVED' as const,
      createdAt: teacher.createdAt.toISOString(),
    }));

    return {
      pendingRequests,
      joinedTeachers,
    };
  }

  // Principal이 선생님 가입 신청 승인
  async approveTeacherJoinRequest(requestId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { principalId },
      });
    }

    // 가입 신청 조회
    const joinRequest = await this.prisma.academyJoinRequest.findFirst({
      where: {
        id: requestId,
        academyId: principal.academyId,
        status: 'PENDING',
      },
      include: {
        teacher: true,
        academy: true,
      },
    });

    if (!joinRequest) {
      throw new NotFoundException({
        code: 'JOIN_REQUEST_NOT_FOUND',
        message: '해당 가입 신청을 찾을 수 없습니다.',
        details: { requestId },
      });
    }

    // 트랜잭션으로 승인 처리
    const result = await this.prisma.$transaction(async (tx) => {
      // 가입 신청 상태를 APPROVED로 변경
      await tx.academyJoinRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });

      // 선생님을 학원에 추가
      const updatedTeacher = await tx.teacher.update({
        where: { id: joinRequest.teacherId },
        data: { academyId: principal.academyId },
        include: {
          academy: true,
        },
      });

      return updatedTeacher;
    });

    return result;
  }

  // Principal이 선생님 가입 신청 거절
  async rejectTeacherJoinRequest(
    requestId: number,
    principalId: number,
    reason?: string,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { principalId },
      });
    }

    // 가입 신청 조회
    const joinRequest = await this.prisma.academyJoinRequest.findFirst({
      where: {
        id: requestId,
        academyId: principal.academyId,
        status: 'PENDING',
      },
    });

    if (!joinRequest) {
      throw new NotFoundException({
        code: 'JOIN_REQUEST_NOT_FOUND',
        message: '해당 가입 신청을 찾을 수 없습니다.',
        details: { requestId },
      });
    }

    // 가입 신청 상태를 REJECTED로 변경
    const updatedRequest = await this.prisma.academyJoinRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        message: reason
          ? `${joinRequest.message}\n\n거절 사유: ${reason}`
          : joinRequest.message,
      },
    });

    return updatedRequest;
  }

  // Principal의 학원 가입 신청 대기 선생님 목록 조회 (userId로)
  async getTeacherJoinRequestsByUserId(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.getTeacherJoinRequests(principal.id);
  }

  // Principal이 선생님 가입 신청 승인 (userId로)
  async approveTeacherJoinRequestByUserId(requestId: number, userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.approveTeacherJoinRequest(requestId, principal.id);
  }

  // Principal이 선생님 가입 신청 거절 (userId로)
  async rejectTeacherJoinRequestByUserId(
    requestId: number,
    userId: number,
    reason?: string,
  ) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
    });

    if (!principal) {
      throw new NotFoundException({
        code: 'PRINCIPAL_NOT_FOUND',
        message: 'Principal을 찾을 수 없습니다.',
        details: { userId },
      });
    }

    return this.rejectTeacherJoinRequest(requestId, principal.id, reason);
  }
}

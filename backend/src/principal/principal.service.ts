import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAcademyDto } from './dto/update-academy.dto';

@Injectable()
export class PrincipalService {
  constructor(private prisma: PrismaService) {}

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

    return principal.academy.students.map((studentAcademy) => ({
      ...studentAcademy.student,
      joinedAt: studentAcademy.joinedAt,
    }));
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

  // Principal 프로필 정보 수정
  async updateProfile(principalId: number, updateProfileDto: any) {
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
}

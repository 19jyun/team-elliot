import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { AcademyService } from '../academy/academy.service';
import { CreateClassDto } from '../types/class.types';
import { JoinAcademyRequestDto } from '../academy/dto/join-academy-request.dto';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
    private academyService: AcademyService,
  ) {}

  async createClass(userId: number, data: CreateClassDto, userRole?: string) {
    // 먼저 teacher 정보를 userRefId로 조회
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return this.classService.createClass(data, userRole);
  }

  async getTeacherProfile(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        introduction: true,
        photoUrl: true,
        education: true,
        specialties: true,
        certifications: true,
        yearsOfExperience: true,
        availableTimes: true,
        createdAt: true,
        updatedAt: true,
        academy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return {
      id: teacher.id,
      userId: teacher.userId,
      name: teacher.name,
      phoneNumber: teacher.phoneNumber,
      introduction: teacher.introduction,
      photoUrl: teacher.photoUrl,
      education: teacher.education,
      specialties: teacher.specialties,
      certifications: teacher.certifications,
      yearsOfExperience: teacher.yearsOfExperience,
      availableTimes: teacher.availableTimes,
      academyId: teacher.academy?.id || null,
      academy: teacher.academy
        ? {
            id: teacher.academy.id,
            name: teacher.academy.name,
          }
        : null,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }

  async updateProfile(
    userId: number,
    updateData: {
      name?: string;
      phoneNumber?: string;
      introduction?: string;
      education?: string[];
      specialties?: string[];
      certifications?: string[];
      yearsOfExperience?: number;
      availableTimes?: any;
    },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    // User 테이블 업데이트 데이터 (이름이 변경된 경우에만)
    const userUpdateData = updateData.name
      ? {
          name: updateData.name,
          updatedAt: new Date(),
        }
      : null;

    // 트랜잭션으로 Teacher와 User 테이블 동시 업데이트
    const updatedTeacher = await this.prisma.$transaction(async (tx) => {
      // Teacher 테이블 업데이트
      const teacher = await tx.teacher.update({
        where: { userRefId: userId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          userId: true,
          name: true,
          phoneNumber: true,
          introduction: true,
          photoUrl: true,
          education: true,
          specialties: true,
          certifications: true,
          yearsOfExperience: true,
          availableTimes: true,
          createdAt: true,
          updatedAt: true,
          academy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 이름이 변경된 경우 User 테이블도 업데이트
      if (userUpdateData) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      return teacher;
    });

    return {
      id: updatedTeacher.id,
      userId: updatedTeacher.userId,
      name: updatedTeacher.name,
      phoneNumber: updatedTeacher.phoneNumber,
      introduction: updatedTeacher.introduction,
      photoUrl: updatedTeacher.photoUrl,
      education: updatedTeacher.education,
      specialties: updatedTeacher.specialties,
      certifications: updatedTeacher.certifications,
      yearsOfExperience: updatedTeacher.yearsOfExperience,
      availableTimes: updatedTeacher.availableTimes,
      academyId: updatedTeacher.academy?.id || null,
      academy: updatedTeacher.academy
        ? {
            id: updatedTeacher.academy.id,
            name: updatedTeacher.academy.name,
          }
        : null,
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt,
    };
  }

  async updateProfilePhoto(userId: number, photo: Express.Multer.File) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    const photoUrl = `/uploads/teacher-photos/${photo.filename}`;

    const updatedTeacher = await this.prisma.teacher.update({
      where: { userRefId: userId },
      data: {
        photoUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        introduction: true,
        photoUrl: true,
        education: true,
        specialties: true,
        certifications: true,
        yearsOfExperience: true,
        availableTimes: true,
        createdAt: true,
        updatedAt: true,
        academy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updatedTeacher.id,
      userId: updatedTeacher.userId,
      name: updatedTeacher.name,
      phoneNumber: updatedTeacher.phoneNumber,
      introduction: updatedTeacher.introduction,
      photoUrl: updatedTeacher.photoUrl,
      education: updatedTeacher.education,
      specialties: updatedTeacher.specialties,
      certifications: updatedTeacher.certifications,
      yearsOfExperience: updatedTeacher.yearsOfExperience,
      availableTimes: updatedTeacher.availableTimes,
      academyId: updatedTeacher.academy?.id || null,
      academy: updatedTeacher.academy
        ? {
            id: updatedTeacher.academy.id,
            name: updatedTeacher.academy.name,
          }
        : null,
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt,
    };
  }

  async getTeacherClasses(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
      include: {
        classes: {
          include: {
            enrollments: {
              include: {
                student: {
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
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    // startDate와 endDate를 포함하여 반환
    return teacher.classes.map((class_) => ({
      id: class_.id,
      className: class_.className,
      dayOfWeek: class_.dayOfWeek,
      startTime: class_.startTime,
      endTime: class_.endTime,
      startDate: class_.startDate,
      endDate: class_.endDate,
      maxStudents: class_.maxStudents,
      level: class_.level,
      tuitionFee: class_.tuitionFee,
      description: class_.description,
      backgroundColor: class_.backgroundColor,
      enrollments: class_.enrollments,
    }));
  }

  async getTeacherClassesWithSessions(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
      include: {
        classes: {
          include: {
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            classSessions: {
              include: {
                enrollments: {
                  include: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        level: true,
                      },
                    },
                    payment: true,
                    refundRequests: true,
                  },
                },
              },
              orderBy: {
                date: 'asc',
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

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
    const allSessions = teacher.classes.flatMap(
      (class_) => class_.classSessions,
    );
    let latestSessionDate: Date | null = null;
    if (allSessions.length > 0) {
      latestSessionDate = new Date(
        Math.max(
          ...allSessions.map((s) => {
            const sessionDate = new Date(s.date);
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
    // const todayKST = new Date(
    //   kstNow.getFullYear(),
    //   kstNow.getMonth(),
    //   kstNow.getDate(),
    // );
    // const futureSessions = teacher.classes.flatMap((class_) =>
    //   class_.classSessions.filter((session) => {
    //     const sessionDate = new Date(session.date);
    //     const kstSessionDate = new Date(
    //       sessionDate.getTime() + 9 * 60 * 60 * 1000,
    //     );
    //     return kstSessionDate >= todayKST;
    //   }),
    // );

    const calendarRange = {
      startDate,
      endDate,
    };

    // 클래스와 세션 정보를 분리하여 반환
    const classes = teacher.classes.map((class_) => ({
      id: class_.id,
      className: class_.className,
      dayOfWeek: class_.dayOfWeek,
      startTime: class_.startTime,
      endTime: class_.endTime,
      startDate: class_.startDate,
      endDate: class_.endDate,
      maxStudents: class_.maxStudents,
      level: class_.level,
      tuitionFee: class_.tuitionFee,
      description: class_.description,
      backgroundColor: class_.backgroundColor,

      enrollments: class_.enrollments,
    }));

    // 미래/오늘 세션만 필터링하여 반환 (지난 세션 제외)
    const sessions = teacher.classes.flatMap((class_) =>
      class_.classSessions
        .filter((session) => {
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
          return kstNow < kstSessionEndTime;
        })
        .map((session) => ({
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          class: {
            id: class_.id,
            className: class_.className,
            maxStudents: class_.maxStudents,
            level: class_.level,
            teacher: {
              id: teacher.id,
              name: teacher.name,
            },
          },
          enrollmentCount: session.currentStudents || 0,
          confirmedCount: session.enrollments.filter(
            (enrollment) => enrollment.status === 'CONFIRMED',
          ).length,
        })),
    );

    return {
      classes,
      sessions,
      calendarRange,
    };
  }

  // 선생님의 현재 학원 정보 조회
  async getMyAcademy(userId: number) {
    // 먼저 teacher 정보를 userRefId로 조회
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return this.academyService.getTeacherAcademy(teacher.id);
  }

  // 선생님의 학원 변경
  async changeAcademy(userId: number, academyCode: string) {
    // 먼저 teacher 정보를 userRefId로 조회
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return this.academyService.changeTeacherAcademy(teacher.id, academyCode);
  }

  // 선생님 학원 탈퇴
  async leaveAcademy(userId: number) {
    // 먼저 teacher 정보를 userRefId로 조회
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return this.academyService.leaveAcademyByTeacher(teacher.id);
  }

  // 학원 가입 요청
  async requestJoinAcademy(
    userId: number,
    joinAcademyRequestDto: JoinAcademyRequestDto,
  ) {
    // 먼저 teacher 정보를 userRefId로 조회
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    return this.academyService.requestJoinAcademyByTeacher(
      teacher.id,
      joinAcademyRequestDto,
    );
  }

  // Teacher 대시보드 Redux 초기화용 데이터 조회
  async getTeacherData(userId: number) {
    const teacherData = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
      include: {
        academy: {
          include: {
            principal: true,
            classes: {
              include: {
                teacher: true,
                classSessions: {
                  include: {
                    enrollments: {
                      include: {
                        student: true,
                        payment: true,
                        refundRequests: { include: { student: true } },
                      },
                    },
                    contents: {
                      include: {
                        pose: true,
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

    if (!teacherData) {
      throw new NotFoundException('Teacher not found');
    }

    if (!teacherData.academy) {
      throw new NotFoundException('Teacher is not associated with any academy');
    }

    // Principal 정보
    const principal = teacherData.academy.principal;

    // 모든 세션을 하나의 배열로 변환
    const sessions = teacherData.academy.classes.flatMap((cls) =>
      cls.classSessions.map((session) => ({
        id: session.id,
        classId: session.classId,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        currentStudents: session.enrollments.length,
        maxStudents: cls.maxStudents,
        class: {
          id: cls.id,
          className: cls.className,
          level: cls.level,
          tuitionFee: cls.tuitionFee?.toString() || '50000',
          teacher: {
            id: cls.teacher.id,
            name: cls.teacher.name,
          },
        },
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
          payment: enrollment.payment,
          refundRequests: enrollment.refundRequests,
        })),
        contents: session.contents.map((content) => ({
          id: content.id,
          sessionId: content.sessionId,
          poseId: content.poseId,
          order: content.order,
          pose: content.pose,
        })),
      })),
    );

    // 모든 수강신청을 하나의 배열로 변환
    const enrollments = sessions.flatMap((session) =>
      session.enrollments.map((enrollment) => ({
        ...enrollment,
        session: {
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          class: session.class,
        },
      })),
    );

    return {
      userProfile: {
        id: teacherData.id,
        userId: teacherData.userId,
        name: teacherData.name,
        phoneNumber: teacherData.phoneNumber,
        introduction: teacherData.introduction,
        photoUrl: teacherData.photoUrl,
        education: teacherData.education,
        specialties: teacherData.specialties,
        certifications: teacherData.certifications,
        yearsOfExperience: teacherData.yearsOfExperience,
        availableTimes: teacherData.availableTimes,
        academy: {
          id: teacherData.academy.id,
          name: teacherData.academy.name,
        },
      },
      academy: teacherData.academy,
      principal: principal
        ? {
            id: principal.id,
            name: principal.name,
            phoneNumber: principal.phoneNumber,
            email: principal.email,
          }
        : null,
      classes: teacherData.academy.classes.map((cls) => ({
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
          id: teacherData.academy.id,
          name: teacherData.academy.name,
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
          contents: session.contents.map((content) => ({
            id: content.id,
            sessionId: content.sessionId,
            poseId: content.poseId,
            order: content.order,
            pose: content.pose,
          })),
        })),
      })),
      sessions,
      enrollments,
    };
  }

  // Principal의 학원 모든 강사 조회
  async getPrincipalTeachers(principalId: number) {
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

  // Principal이 강사 제거
  async removeTeacherByPrincipal(teacherId: number, principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: { academy: true },
    });

    if (!principal) {
      throw new NotFoundException('Principal not found');
    }

    // 해당 강사가 Principal의 학원에 속하는지 확인
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        id: teacherId,
        academyId: principal.academyId,
      },
    });

    if (!teacher) {
      throw new ForbiddenException('해당 강사에 접근할 권한이 없습니다.');
    }

    // Principal 자신은 제거할 수 없음
    if (teacherId === principalId) {
      throw new BadRequestException('자신을 제거할 수 없습니다.');
    }

    // 강사 제거 (학원에서 분리)
    const removedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: null,
      },
      include: {
        academy: true,
      },
    });

    return removedTeacher;
  }
}

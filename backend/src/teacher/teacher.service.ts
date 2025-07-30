import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { CreateClassDto } from '../admin/dto/create-class.dto';
import { CreateAcademyDto } from '../academy/dto/create-academy.dto';
import { UpdateAcademyDto } from '../academy/dto/update-academy.dto';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
  ) {}

  async createClass(
    teacherId: number,
    data: CreateClassDto,
    userRole?: string,
  ) {
    return this.classService.createClass(data, userRole);
  }

  async getTeacherProfile(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
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
    id: number,
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
    photo?: Express.Multer.File,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    const photoUrl = photo
      ? `/uploads/profile-photos/${photo.filename}`
      : undefined;

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data: {
        ...updateData,
        ...(photoUrl && { photoUrl }),
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

  async getTeacherClasses(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
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

  async getTeacherClassesWithSessions(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
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
    const todayKST = new Date(
      kstNow.getFullYear(),
      kstNow.getMonth(),
      kstNow.getDate(),
    );
    const futureSessions = teacher.classes.flatMap((class_) =>
      class_.classSessions.filter((session) => {
        const sessionDate = new Date(session.date);
        const kstSessionDate = new Date(
          sessionDate.getTime() + 9 * 60 * 60 * 1000,
        );
        return kstSessionDate >= todayKST;
      }),
    );

    let calendarRange = {
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

  // 선생님의 현재 학원 정보 조회 (관리자 정보 포함)
  async getMyAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            admins: {
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
    });
    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }
    return teacher.academy;
  }

  // 선생님의 학원 변경
  async changeAcademy(teacherId: number, academyCode: string) {
    const academy = await this.prisma.academy.findUnique({
      where: { code: academyCode },
    });
    if (!academy) {
      throw new NotFoundException('해당 코드의 학원을 찾을 수 없습니다.');
    }

    // 관리자인 경우 탈퇴 불가
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            admins: true,
          },
        },
      },
    });

    const isAdmin = teacher?.academy?.admins.some(
      (admin) => admin.teacherId === teacherId,
    );
    if (isAdmin) {
      throw new BadRequestException(
        '학원 관리자는 탈퇴할 수 없습니다. 다른 관리자에게 권한을 이전하거나 학원을 삭제해주세요.',
      );
    }

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: academy.id,
        updatedAt: new Date(),
      },
      include: {
        academy: {
          include: {
            admins: {
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
    });
    return updatedTeacher.academy;
  }

  // 선생님이 새 학원 생성 (관리자 지정)
  async createAcademy(createAcademyDto: CreateAcademyDto, teacherId: number) {
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { code: createAcademyDto.code },
    });
    if (existingAcademy) {
      throw new ConflictException('이미 존재하는 학원 코드입니다.');
    }

    // 새 학원 생성 및 관리자 지정
    const newAcademy = await this.prisma.academy.create({
      data: {
        ...createAcademyDto,
        admins: {
          create: {
            teacherId: teacherId,
            role: 'OWNER',
          },
        },
      },
    });
    return newAcademy;
  }

  // 선생님이 새 학원을 생성하고 자동으로 소속되기 (관리자 지정)
  async createAndJoinAcademy(
    teacherId: number,
    createAcademyDto: CreateAcademyDto,
  ) {
    // 새 학원 생성
    const newAcademy = await this.createAcademy(createAcademyDto, teacherId);
    // 선생님을 새 학원에 소속시키기
    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: newAcademy.id,
        updatedAt: new Date(),
      },
      include: {
        academy: {
          include: {
            admins: {
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
    });
    return {
      academy: updatedTeacher.academy,
      teacher: updatedTeacher,
    };
  }

  // 학원 정보 수정 (관리자만)
  async updateAcademy(teacherId: number, updateAcademyDto: UpdateAcademyDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            admins: true,
          },
        },
      },
    });
    if (!teacher || !teacher.academy) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    const isAdmin = teacher.academy.admins.some(
      (admin) => admin.teacherId === teacherId,
    );
    if (!isAdmin) {
      throw new ForbiddenException('학원 정보 수정 권한이 없습니다.');
    }

    return this.prisma.academy.update({
      where: { id: teacher.academy.id },
      data: updateAcademyDto,
    });
  }

  // 선생님 학원 탈퇴 (관리자 불가)
  async leaveAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    if (!teacher.academy) {
      throw new BadRequestException('소속된 학원이 없습니다.');
    }

    // 학원 관리자인 경우 탈퇴 불가
    const isAdmin = teacher.academy.admins.some(
      (admin) => admin.teacherId === teacherId,
    );
    if (isAdmin) {
      throw new ForbiddenException('학원 관리자는 탈퇴할 수 없습니다.');
    }

    await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { academyId: null },
    });

    return { message: '학원 탈퇴가 완료되었습니다.' };
  }

  // === 새로운 API 메서드들 ===

  // 1. 특정 선생님을 학원에서 제거하는 API
  async removeTeacherFromAcademy(
    adminTeacherId: number,
    targetTeacherId: number,
  ) {
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

    const adminRole = adminTeacher.academy.admins.find(
      (admin) => admin.teacherId === adminTeacherId,
    );
    if (!adminRole) {
      throw new ForbiddenException('학원 관리 권한이 없습니다.');
    }

    const targetTeacher = await this.prisma.teacher.findUnique({
      where: { id: targetTeacherId },
      include: {
        academy: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (
      !targetTeacher?.academy ||
      targetTeacher.academy.id !== adminTeacher.academy.id
    ) {
      throw new NotFoundException('해당 선생님을 찾을 수 없습니다.');
    }

    const targetRole = targetTeacher.academy.admins.find(
      (admin) => admin.teacherId === targetTeacherId,
    );

    // 권한 hierarchy 확인
    if (adminRole.role === 'ADMIN' && targetRole?.role === 'OWNER') {
      throw new ForbiddenException('ADMIN은 OWNER를 제거할 수 없습니다.');
    }
    if (adminRole.role === 'ADMIN' && targetRole?.role === 'ADMIN') {
      throw new ForbiddenException('ADMIN은 다른 ADMIN을 제거할 수 없습니다.');
    }

    // 선생님의 클래스, 세션, 수강 신청 내역 삭제
    await this.prisma.$transaction(async (tx) => {
      // 1. 선생님의 세션 수강 신청 내역 삭제
      await tx.sessionEnrollment.deleteMany({
        where: {
          session: {
            class: {
              teacherId: targetTeacherId,
            },
          },
        },
      });

      // 2. 선생님의 세션 삭제
      await tx.classSession.deleteMany({
        where: {
          class: {
            teacherId: targetTeacherId,
          },
        },
      });

      // 3. 선생님의 클래스 수강 신청 내역 삭제
      await tx.enrollment.deleteMany({
        where: {
          class: {
            teacherId: targetTeacherId,
          },
        },
      });

      // 4. 선생님의 클래스 삭제
      await tx.class.deleteMany({
        where: {
          teacherId: targetTeacherId,
        },
      });

      // 5. 학원 관리자 권한 제거
      await tx.academyAdmin.deleteMany({
        where: {
          academyId: adminTeacher.academy.id,
          teacherId: targetTeacherId,
        },
      });

      // 6. 선생님을 학원에서 제거
      await tx.teacher.update({
        where: { id: targetTeacherId },
        data: { academyId: null },
      });
    });

    return { message: '선생님이 학원에서 제거되었습니다.' };
  }

  // 2. 관리자 권한 부여 API
  async assignAdminRole(adminTeacherId: number, targetTeacherId: number) {
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

    const adminRole = adminTeacher.academy.admins.find(
      (admin) => admin.teacherId === adminTeacherId,
    );
    if (!adminRole || adminRole.role !== 'OWNER') {
      throw new ForbiddenException('OWNER만 관리자 권한을 부여할 수 있습니다.');
    }

    const targetTeacher = await this.prisma.teacher.findUnique({
      where: { id: targetTeacherId },
      include: {
        academy: true,
      },
    });

    if (
      !targetTeacher?.academy ||
      targetTeacher.academy.id !== adminTeacher.academy.id
    ) {
      throw new NotFoundException('해당 선생님을 찾을 수 없습니다.');
    }

    // 이미 관리자인지 확인
    const existingAdmin = await this.prisma.academyAdmin.findUnique({
      where: {
        academyId_teacherId: {
          academyId: adminTeacher.academy.id,
          teacherId: targetTeacherId,
        },
      },
    });

    if (existingAdmin) {
      throw new BadRequestException('이미 관리자 권한을 가지고 있습니다.');
    }

    // 관리자 권한 부여
    await this.prisma.academyAdmin.create({
      data: {
        academyId: adminTeacher.academy.id,
        teacherId: targetTeacherId,
        role: 'ADMIN',
      },
    });

    return { message: '관리자 권한이 부여되었습니다.' };
  }

  // 3. 관리자 권한 제거 API
  async removeAdminRole(adminTeacherId: number, targetTeacherId: number) {
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

    const adminRole = adminTeacher.academy.admins.find(
      (admin) => admin.teacherId === adminTeacherId,
    );
    if (!adminRole || adminRole.role !== 'OWNER') {
      throw new ForbiddenException('OWNER만 관리자 권한을 제거할 수 있습니다.');
    }

    const targetRole = adminTeacher.academy.admins.find(
      (admin) => admin.teacherId === targetTeacherId,
    );
    if (!targetRole) {
      throw new NotFoundException('해당 선생님은 관리자가 아닙니다.');
    }

    if (targetRole.role === 'OWNER') {
      throw new BadRequestException('OWNER 권한은 제거할 수 없습니다.');
    }

    // 관리자 권한 제거
    await this.prisma.academyAdmin.delete({
      where: {
        academyId_teacherId: {
          academyId: adminTeacher.academy.id,
          teacherId: targetTeacherId,
        },
      },
    });

    return { message: '관리자 권한이 제거되었습니다.' };
  }

  // 4. 수강생의 세션 수강 현황 조회 API
  async getStudentSessionHistory(teacherId: number, studentId: number) {
    // 권한 확인
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!teacher?.academy) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    const isAdmin = teacher.academy.admins.some(
      (admin) => admin.teacherId === teacherId,
    );
    if (!isAdmin) {
      throw new ForbiddenException('학원 관리 권한이 없습니다.');
    }

    // 수강생이 해당 학원에 속하는지 확인
    const studentAcademy = await this.prisma.studentAcademy.findUnique({
      where: {
        studentId_academyId: {
          studentId: studentId,
          academyId: teacher.academy.id,
        },
      },
    });

    if (!studentAcademy) {
      throw new NotFoundException('해당 수강생을 찾을 수 없습니다.');
    }

    // 수강생의 세션 수강 현황 조회
    const sessionEnrollments = await this.prisma.sessionEnrollment.findMany({
      where: {
        studentId: studentId,
        session: {
          class: {
            academyId: teacher.academy.id,
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
        payment: true,
        refundRequests: true,
      },
      orderBy: {
        session: {
          date: 'desc',
        },
      },
    });

    return sessionEnrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      cancelledAt: enrollment.cancelledAt,
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
    }));
  }

  // 5. 선생님 지정하여 강의 개설
  async createClassWithTeacher(
    adminTeacherId: number,
    classData: CreateClassDto,
    assignedTeacherId: number,
  ) {
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

    // 지정된 선생님이 같은 학원에 속하는지 확인
    const assignedTeacher = await this.prisma.teacher.findUnique({
      where: { id: assignedTeacherId },
    });

    if (
      !assignedTeacher ||
      assignedTeacher.academyId !== adminTeacher.academy.id
    ) {
      throw new NotFoundException('지정된 선생님을 찾을 수 없습니다.');
    }

    // 클래스 생성 (지정된 선생님으로)
    const classWithTeacher = {
      ...classData,
      teacherId: assignedTeacherId,
      academyId: adminTeacher.academy.id,
    };

    return this.classService.createClass(classWithTeacher);
  }

  // 6. 학원 소속 선생님 목록 조회
  async getAcademyTeachers(adminTeacherId: number) {
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

    // 학원 소속 선생님 목록 조회
    const teachers = await this.prisma.teacher.findMany({
      where: {
        academyId: adminTeacher.academy.id,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        introduction: true,
        photoUrl: true,
        education: true,
        specialties: true,
        certifications: true,
        yearsOfExperience: true,
        createdAt: true,
        managedAcademies: {
          where: {
            academyId: adminTeacher.academy.id,
          },
          select: {
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      phoneNumber: teacher.phoneNumber,
      introduction: teacher.introduction,
      photoUrl: teacher.photoUrl,
      education: teacher.education,
      specialties: teacher.specialties,
      certifications: teacher.certifications,
      yearsOfExperience: teacher.yearsOfExperience,
      joinedAt: teacher.createdAt,
      adminRole: teacher.managedAcademies[0]?.role || null,
      adminSince: teacher.managedAcademies[0]?.createdAt || null,
    }));
  }

  // Principal용 학원 소속 선생님 목록 조회
  async getAcademyTeachersForPrincipal(principalId: number) {
    // Principal의 학원 정보 확인
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
      include: {
        academy: true,
      },
    });

    if (!principal?.academy) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    // 학원 소속 선생님 목록 조회
    const teachers = await this.prisma.teacher.findMany({
      where: {
        academyId: principal.academy.id,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        introduction: true,
        photoUrl: true,
        education: true,
        specialties: true,
        certifications: true,
        yearsOfExperience: true,
        createdAt: true,
        managedAcademies: {
          where: {
            academyId: principal.academy.id,
          },
          select: {
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      phoneNumber: teacher.phoneNumber,
      introduction: teacher.introduction,
      photoUrl: teacher.photoUrl,
      education: teacher.education,
      specialties: teacher.specialties,
      certifications: teacher.certifications,
      yearsOfExperience: teacher.yearsOfExperience,
      joinedAt: teacher.createdAt,
      adminRole: teacher.managedAcademies[0]?.role || null,
      adminSince: teacher.managedAcademies[0]?.createdAt || null,
    }));
  }

  // 7. 학원 소속 수강생 목록 조회
  async getAcademyStudents(adminTeacherId: number) {
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

    // 학원 소속 수강생 목록 조회
    const students = await this.prisma.student.findMany({
      where: {
        academies: {
          some: {
            academyId: adminTeacher.academy.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        emergencyContact: true,
        birthDate: true,
        notes: true,
        level: true,
        academies: {
          where: {
            academyId: adminTeacher.academy.id,
          },
          select: {
            joinedAt: true,
          },
        },
        sessionEnrollments: {
          where: {
            session: {
              class: {
                academyId: adminTeacher.academy.id,
              },
            },
          },
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            session: {
              select: {
                id: true,
                date: true,
                class: {
                  select: {
                    id: true,
                    className: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return students.map((student) => ({
      id: student.id,
      name: student.name,
      phoneNumber: student.phoneNumber,
      emergencyContact: student.emergencyContact,
      birthDate: student.birthDate,
      notes: student.notes,
      level: student.level,
      joinedAt: student.academies[0]?.joinedAt,
      totalSessions: student.sessionEnrollments.length,
      confirmedSessions: student.sessionEnrollments.filter(
        (enrollment) => enrollment.status === 'CONFIRMED',
      ).length,
      pendingSessions: student.sessionEnrollments.filter(
        (enrollment) => enrollment.status === 'PENDING',
      ).length,
    }));
  }

  // 수강 신청/환불 신청 관리 관련 메서드들
  async getSessionsWithEnrollmentRequests(teacherId: number) {
    const sessions = await this.prisma.classSession.findMany({
      where: {
        class: {
          teacherId: teacherId,
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
    }));
  }

  async getSessionsWithRefundRequests(teacherId: number) {
    const sessions = await this.prisma.classSession.findMany({
      where: {
        class: {
          teacherId: teacherId,
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
    }));
  }
}

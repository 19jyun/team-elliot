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

  async createClass(teacherId: number, data: CreateClassDto) {
    return this.classService.createClass(data);
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

    // 캘린더 범위 계산 (선생님이 담당하는 클래스들의 startDate/endDate 기준)
    const allSessions = teacher.classes.flatMap(
      (class_) => class_.classSessions,
    );
    let calendarRange = null;

    if (allSessions.length > 0) {
      const sessionDates = allSessions.map((session) => session.date);
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

    const sessions = teacher.classes.flatMap((class_) =>
      class_.classSessions.map((session) => ({
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

  // 선생님의 현재 학원 정보 조회 (admin 정보 포함)
  async getMyAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: {
          include: {
            admin: true,
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
      include: { academy: true },
    });
    if (teacher?.academy?.adminId === teacherId) {
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
          include: { admin: true },
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
    // 새 학원 생성 (adminId 지정)
    const newAcademy = await this.prisma.academy.create({
      data: { ...createAcademyDto, adminId: teacherId },
    });
    return newAcademy;
  }

  // 선생님이 새 학원을 생성하고 자동으로 소속되기 (관리자 지정)
  async createAndJoinAcademy(
    teacherId: number,
    createAcademyDto: CreateAcademyDto,
  ) {
    // 새 학원 생성 (adminId 지정)
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
          include: { admin: true },
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
      include: { academy: true },
    });
    if (!teacher || !teacher.academy) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }
    if (teacher.academy.adminId !== teacherId) {
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
      include: { academy: true },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    if (!teacher.academy) {
      throw new BadRequestException('소속된 학원이 없습니다.');
    }

    // 학원 관리자인 경우 탈퇴 불가
    if (teacher.academy.adminId === teacherId) {
      throw new ForbiddenException('학원 관리자는 탈퇴할 수 없습니다.');
    }

    await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { academyId: null },
    });

    return { message: '학원 탈퇴가 완료되었습니다.' };
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

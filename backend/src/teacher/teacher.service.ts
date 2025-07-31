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
import { JoinAcademyRequestDto } from '../academy/dto/join-academy-request.dto';

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

  // 선생님의 현재 학원 정보 조회
  async getMyAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: true,
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

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: {
        academyId: academy.id,
        updatedAt: new Date(),
      },
      include: {
        academy: true,
      },
    });
    return updatedTeacher.academy;
  }

  // 선생님이 새 학원 생성
  async createAcademy(createAcademyDto: CreateAcademyDto, teacherId: number) {
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { code: createAcademyDto.code },
    });
    if (existingAcademy) {
      throw new ConflictException('이미 존재하는 학원 코드입니다.');
    }

    // 새 학원 생성
    const newAcademy = await this.prisma.academy.create({
      data: createAcademyDto,
    });
    return newAcademy;
  }

  // 선생님이 새 학원을 생성하고 자동으로 소속되기
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
        academy: true,
      },
    });
    return {
      academy: updatedTeacher.academy,
      teacher: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        academyId: updatedTeacher.academyId,
      },
    };
  }

  // 학원 정보 수정
  async updateAcademy(teacherId: number, updateAcademyDto: UpdateAcademyDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        academy: true,
      },
    });
    if (!teacher || !teacher.academy) {
      throw new NotFoundException('소속된 학원이 없습니다.');
    }

    return this.prisma.academy.update({
      where: { id: teacher.academy.id },
      data: updateAcademyDto,
    });
  }

  // 선생님 학원 탈퇴
  async leaveAcademy(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    if (!teacher.academyId) {
      throw new BadRequestException('소속된 학원이 없습니다.');
    }

    await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { academyId: null },
    });

    return { message: '학원 탈퇴가 완료되었습니다.' };
  }

  // 학원 가입 요청
  async requestJoinAcademy(
    teacherId: number,
    joinAcademyRequestDto: JoinAcademyRequestDto,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    // 이미 학원에 소속되어 있는지 확인
    if (teacher.academyId) {
      throw new BadRequestException(
        '이미 학원에 소속되어 있습니다. 새 학원에 가입하려면 먼저 현재 학원을 탈퇴해주세요.',
      );
    }

    // 학원 코드로 학원 찾기
    const academy = await this.prisma.academy.findUnique({
      where: { code: joinAcademyRequestDto.code },
    });

    if (!academy) {
      throw new NotFoundException('해당 코드의 학원을 찾을 수 없습니다.');
    }

    // 이미 가입 요청이 있는지 확인
    const existingRequest = await this.prisma.academyJoinRequest.findUnique({
      where: {
        teacherId_academyId: {
          teacherId,
          academyId: academy.id,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new ConflictException('이미 가입 요청이 대기 중입니다.');
      } else if (existingRequest.status === 'APPROVED') {
        throw new ConflictException('이미 승인된 가입 요청이 있습니다.');
      }
    }

    // 가입 요청 생성
    const joinRequest = await this.prisma.academyJoinRequest.create({
      data: {
        teacherId,
        academyId: academy.id,
        message: joinAcademyRequestDto.message,
      },
      include: {
        academy: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      message: '학원 가입 요청이 성공적으로 전송되었습니다.',
      request: joinRequest,
    };
  }
}

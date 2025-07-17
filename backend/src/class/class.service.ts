import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Class } from '@prisma/client';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async getAllClasses(filters: { dayOfWeek?: string; teacherId?: number }) {
    return this.prisma.class.findMany({
      where: {
        ...(filters.dayOfWeek && { dayOfWeek: filters.dayOfWeek }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            introduction: true,
          },
        },
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
    });
  }

  async createClass(data: {
    className: string;
    description: string;
    maxStudents: number;
    tuitionFee: number;
    teacherId: number;
    academyId: number;
    dayOfWeek: string;
    level: string;
    startTime: string;
    endTime: string;
    startDate: string; // UTC ISO 문자열
    endDate: string; // UTC ISO 문자열
  }) {
    console.log('=== createClass 호출됨 ===');
    console.log('받은 데이터:', {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
      startDateType: typeof data.startDate,
      endDateType: typeof data.endDate,
    });

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    // 요일 유효성 검증
    const validDays = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];
    if (!validDays.includes(data.dayOfWeek)) {
      throw new BadRequestException(
        '유효하지 않은 요일입니다. MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY 중 하나를 입력해주세요.',
      );
    }

    // 레벨 유효성 검증
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (!validLevels.includes(data.level)) {
      throw new BadRequestException(
        '유효하지 않은 레벨입니다. BEGINNER, INTERMEDIATE, ADVANCED 중 하나를 입력해주세요.',
      );
    }

    console.log('DTO에서 변환된 startDate:', data.startDate);
    console.log('DTO에서 변환된 endDate:', data.endDate);

    // 시작일이 종료일보다 늦은지 확인
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('시작일은 종료일보다 이전이어야 합니다.');
    }

    // 고유한 클래스 코드 생성
    const classCode = await this.generateUniqueClassCode(data.dayOfWeek);

    // 클래스 생성
    const createdClass = await this.prisma.class.create({
      data: {
        className: data.className,
        classCode,
        description: data.description,
        maxStudents: data.maxStudents,
        tuitionFee: data.tuitionFee,
        dayOfWeek: data.dayOfWeek,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        level: data.level,
        status: 'DRAFT',
        teacher: {
          connect: {
            id: data.teacherId,
          },
        },
        academy: {
          connect: {
            id: data.academyId,
          },
        },
      },
    });

    console.log('생성된 클래스:', createdClass);

    console.log('=== generateClassSessions 호출됨 ===');
    console.log('createdClass.id:', createdClass.id);
    console.log('data.dayOfWeek:', data.dayOfWeek);
    console.log('data.startTime:', data.startTime);
    console.log('data.endTime:', data.endTime);
    console.log('data.startDate:', data.startDate);
    console.log('data.endDate:', data.endDate);

    // 클래스 세션 자동 생성
    const sessionCount = await this.generateClassSessions(createdClass.id, {
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });

    return {
      ...createdClass,
      sessionCount,
      message: `${sessionCount}개의 세션이 자동으로 생성되었습니다.`,
    };
  }

  // 고유한 클래스 코드 생성 메서드
  private async generateUniqueClassCode(dayOfWeek: string): Promise<string> {
    const baseCode = `BALLET-${dayOfWeek.substring(0, 3)}`;

    // 해당 요일의 기존 클래스 코드들 중 최대 번호 찾기
    const existingClasses = await this.prisma.class.findMany({
      where: {
        classCode: {
          startsWith: baseCode,
        },
      },
      select: {
        classCode: true,
      },
    });

    // 기존 코드에서 번호 추출하여 최대값 찾기
    let maxNumber = 0;
    existingClasses.forEach((cls) => {
      const match = cls.classCode.match(new RegExp(`^${baseCode}-(\\d+)$`));
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    // 다음 번호 사용
    const nextNumber = maxNumber + 1;
    const classCode = `${baseCode}-${nextNumber.toString().padStart(3, '0')}`;

    return classCode;
  }

  // 클래스 세션 자동 생성 메서드
  private async generateClassSessions(
    classId: number,
    schedule: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      startDate: Date;
      endDate: Date;
    },
  ): Promise<number> {
    const { dayOfWeek, startTime, endTime, startDate, endDate } = schedule;

    console.log('=== generateClassSessions 시작 ===');
    console.log('classId:', classId);
    console.log('dayOfWeek:', dayOfWeek);
    console.log('startTime:', startTime);
    console.log('endTime:', endTime);
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);

    // 요일을 숫자로 변환 (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const dayOfWeekMap: { [key: string]: number } = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const targetDayOfWeek = dayOfWeekMap[dayOfWeek];
    console.log('targetDayOfWeek:', targetDayOfWeek);

    if (targetDayOfWeek === undefined) {
      throw new BadRequestException('유효하지 않은 요일입니다.');
    }

    // 클래스 정보 조회하여 maxStudents 가져오기
    const classInfo = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { maxStudents: true },
    });

    if (!classInfo) {
      throw new NotFoundException('클래스를 찾을 수 없습니다.');
    }

    const sessions: Array<{
      classId: number;
      date: Date;
      startTime: Date;
      endTime: Date;
      maxStudents: number;
      currentStudents: number;
    }> = [];

    // 시작일부터 종료일까지 해당 요일의 세션들을 생성
    const currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    console.log('currentDate:', currentDate);
    console.log('endDateTime:', endDateTime);

    // endDate까지 포함하여 계산 (endDate 당일까지)
    while (currentDate <= endDateTime) {
      console.log('현재 날짜:', currentDate, '요일:', currentDate.getDay());

      // 현재 날짜가 목표 요일인지 확인
      if (currentDate.getDay() === targetDayOfWeek) {
        console.log('세션 생성 대상 날짜 발견:', currentDate);

        // 해당 날짜의 시작 시간과 종료 시간 계산
        const sessionDate = new Date(currentDate);

        // 시간 설정 (프론트엔드에서 이미 포맷팅된 UTC 시간 사용)
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // 해당 날짜에 시간 설정
        const sessionStartTime = new Date(currentDate);
        sessionStartTime.setHours(startHour, startMinute, 0, 0);

        const sessionEndTime = new Date(currentDate);
        sessionEndTime.setHours(endHour, endMinute, 0, 0);

        sessions.push({
          classId,
          date: sessionDate,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          maxStudents: classInfo.maxStudents,
          currentStudents: 0,
        });
      }

      // 다음 날로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('생성될 세션 개수:', sessions.length);
    console.log('세션 데이터:', JSON.stringify(sessions, null, 2));

    // 세션들을 데이터베이스에 일괄 생성
    if (sessions.length > 0) {
      try {
        await this.prisma.classSession.createMany({
          data: sessions,
          skipDuplicates: true, // 중복 세션이 있을 경우 건너뛰기
        });
        console.log('세션들이 성공적으로 데이터베이스에 저장되었습니다.');
      } catch (error) {
        console.error('세션 생성 중 오류 발생:', error);
        throw error;
      }
    }

    console.log(`${sessions.length}개의 클래스 세션이 생성되었습니다.`);
    return sessions.length;
  }

  async updateClass(id: number, data: any) {
    const existingClass = await this.prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    return this.prisma.class.update({
      where: { id },
      data: {
        ...data,
        ...(data.startTime && {
          startTime: new Date(`1970-01-01T${data.startTime}:00`),
        }),
        ...(data.endTime && {
          endTime: new Date(`1970-01-01T${data.endTime}:00`),
        }),
      },
    });
  }

  async deleteClass(id: number) {
    const existingClass = await this.prisma.class.findUnique({
      where: { id },
      include: {
        enrollments: true,
        classSessions: {
          include: {
            enrollments: {
              include: {
                payment: true,
              },
            },
          },
        },
      },
    });

    if (!existingClass) {
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    if (existingClass.enrollments.length > 0) {
      throw new BadRequestException('수강생이 있는 수업은 삭제할 수 없습니다.');
    }

    // 트랜잭션으로 클래스와 관련된 모든 데이터를 안전하게 삭제
    return this.prisma.$transaction(async (prisma) => {
      console.log(`클래스 ID ${id} 삭제 시작...`);

      // 1. 세션별 수강신청의 결제 정보 삭제
      let deletedPayments = 0;
      for (const session of existingClass.classSessions) {
        for (const enrollment of session.enrollments) {
          if (enrollment.payment) {
            await prisma.payment.delete({
              where: { id: enrollment.payment.id },
            });
            deletedPayments++;
          }
        }
      }
      console.log(`${deletedPayments}개의 결제 정보가 삭제되었습니다.`);

      // 2. 세션별 수강신청 삭제
      const deletedSessionEnrollments =
        await prisma.sessionEnrollment.deleteMany({
          where: {
            sessionId: { in: existingClass.classSessions.map((s) => s.id) },
          },
        });
      console.log(
        `${deletedSessionEnrollments.count}개의 세션 수강신청이 삭제되었습니다.`,
      );

      // 3. 클래스 세션들 삭제
      const deletedSessions = await prisma.classSession.deleteMany({
        where: { classId: id },
      });
      console.log(`${deletedSessions.count}개의 클래스 세션이 삭제되었습니다.`);

      // 4. 마지막으로 클래스 삭제
      const deletedClass = await prisma.class.delete({
        where: { id },
      });
      console.log(`클래스 "${deletedClass.className}"이(가) 삭제되었습니다.`);

      return {
        message: `클래스 "${deletedClass.className}"과 관련된 모든 데이터가 성공적으로 삭제되었습니다.`,
        deletedData: {
          class: 1,
          sessions: deletedSessions.count,
          sessionEnrollments: deletedSessionEnrollments.count,
          payments: deletedPayments,
        },
      };
    });
  }

  async enrollStudent(classId: number, studentId: number) {
    const existingClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { enrollments: true },
    });

    if (!existingClass) {
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    if (
      existingClass.maxStudents &&
      existingClass.enrollments.length >= existingClass.maxStudents
    ) {
      throw new BadRequestException('수업 정원이 초과되었습니다.');
    }

    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('이미 수강 신청된 수업입니다.');
    }

    return this.prisma.enrollment.create({
      data: {
        classId,
        studentId,
      },
    });
  }

  async unenrollStudent(classId: number, studentId: number) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId,
        studentId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('수강 신청 내역을 찾을 수 없습니다.');
    }

    return this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });
  }

  async getClassDetails(id: number) {
    const classWithDetails = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            name: true,
            introduction: true,
            photoUrl: true,
            education: true,
          },
        },
        classDetail: true,
      },
    });

    if (!classWithDetails) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classWithDetails;
  }

  async updateClassDetails(
    id: number,
    data: {
      description?: string;
      locationName?: string;
      mapImageUrl?: string;
      requiredItems?: string[];
      curriculum?: string[];
    },
    teacherId: number,
  ) {
    // 클래스 정보 조회
    const classInfo = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        classDetail: true,
      },
    });

    if (!classInfo) {
      throw new NotFoundException('클래스를 찾을 수 없습니다.');
    }

    // 권한 확인
    if (classInfo.teacherId !== teacherId) {
      throw new ForbiddenException(
        '해당 클래스의 상세 정보를 수정할 권한이 없습니다.',
      );
    }

    // 트랜잭션으로 클래스 상세 정보 업데이트
    const result = await this.prisma.$transaction(async (prisma) => {
      let classDetail;

      if (classInfo.classDetail) {
        // 기존 상세 정보가 있으면 업데이트
        classDetail = await prisma.classDetail.update({
          where: { id: classInfo.classDetail.id },
          data: {
            ...(data.description && { description: data.description }),
            ...(data.locationName && { locationName: data.locationName }),
            ...(data.mapImageUrl && { mapImageUrl: data.mapImageUrl }),
            ...(data.requiredItems && { requiredItems: data.requiredItems }),
            ...(data.curriculum && { curriculum: data.curriculum }),
          },
        });
      } else {
        // 기존 상세 정보가 없으면 새로 생성
        classDetail = await prisma.classDetail.create({
          data: {
            description: data.description || '',
            locationName: data.locationName || '',
            mapImageUrl: data.mapImageUrl || '',
            requiredItems: data.requiredItems || [],
            curriculum: data.curriculum || [],
            teacherId: teacherId,
          },
        });

        // 클래스에 상세 정보 연결
        await prisma.class.update({
          where: { id },
          data: {
            classDetailId: classDetail.id,
          },
        });
      }

      return classDetail;
    });

    return {
      id: classInfo.id,
      className: classInfo.className,
      classDetail: result,
    };
  }

  async getClassesByMonth(month: string, year: number) {
    // registrationMonth 관련 조건 제거, status만 남김
    return this.prisma.class.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });
  }

  async getClassesWithSessionsByMonth(
    month: string,
    year: number,
    studentId?: number,
  ) {
    const targetDate = new Date(`${year}-${month}-01`);
    const nextMonth = new Date(targetDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // 해당 월에 세션이 있는 클래스들을 조회
    const classesWithSessions = await this.prisma.class.findMany({
      where: {
        AND: [
          {
            classSessions: {
              some: {
                date: {
                  gte: targetDate,
                  lt: nextMonth,
                },
              },
            },
          },
          {
            status: 'OPEN',
          },
        ],
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        classSessions: {
          where: {
            date: {
              gte: targetDate,
              lt: nextMonth,
            },
          },
          include: {
            enrollments: {
              where: studentId ? { studentId } : undefined,
              select: {
                id: true,
                status: true,
                studentId: true,
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    // 응답 데이터 구조화
    return classesWithSessions.map((classInfo) => {
      const sessions = classInfo.classSessions.map((session) => {
        // 현재 수강 인원 수 (CONFIRMED 상태만)
        const currentStudents = session.currentStudents || 0;

        // 학생의 개별 수강 신청 상태
        const studentEnrollment = session.enrollments.find(
          (enrollment) => enrollment.studentId === studentId,
        );

        const now = new Date();

        // session.date와 session.startTime을 조합해서 정확한 날짜시간 생성
        const sessionDate = new Date(session.date);
        const sessionStartTimeStr = session.startTime
          .toTimeString()
          .slice(0, 5); // "HH:MM" 형식
        const [hours, minutes] = sessionStartTimeStr.split(':').map(Number);

        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(hours, minutes, 0, 0);

        // 수강 가능 여부 판단 (백엔드에서 처리)
        const isFull = currentStudents >= classInfo.maxStudents;
        const isPastStartTime = now >= sessionStartTime;
        const isAlreadyEnrolled =
          studentEnrollment &&
          (studentEnrollment.status === 'CONFIRMED' ||
            studentEnrollment.status === 'PENDING' ||
            studentEnrollment.status === 'REFUND_REJECTED_CONFIRMED');
        const isEnrollable = !isPastStartTime && !isFull && !isAlreadyEnrolled;

        return {
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          currentStudents,
          maxStudents: classInfo.maxStudents,
          isEnrollable,
          isFull,
          isPastStartTime,
          isAlreadyEnrolled,
          studentEnrollmentStatus: studentEnrollment?.status || null,
        };
      });

      return {
        id: classInfo.id,
        className: classInfo.className,
        teacher: classInfo.teacher,
        dayOfWeek: classInfo.dayOfWeek,
        startTime: classInfo.startTime,
        endTime: classInfo.endTime,
        level: classInfo.level,
        backgroundColor: classInfo.backgroundColor,
        academyId: classInfo.academyId,
        sessions,
      };
    });
  }

  // 기존 클래스에 대한 세션 생성 메서드 (public)
  async generateSessionsForExistingClass(classId: number) {
    const existingClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      throw new NotFoundException('클래스를 찾을 수 없습니다.');
    }

    // 기존 세션이 있는지 확인
    const existingSessions = await this.prisma.classSession.findMany({
      where: { classId },
    });

    if (existingSessions.length > 0) {
      throw new BadRequestException('이미 세션이 생성된 클래스입니다.');
    }

    // 세션 생성
    await this.generateClassSessions(classId, {
      dayOfWeek: existingClass.dayOfWeek,
      startTime: existingClass.startTime.toTimeString().slice(0, 5), // HH:MM 형식으로 변환
      endTime: existingClass.endTime.toTimeString().slice(0, 5), // HH:MM 형식으로 변환
      startDate: existingClass.startDate,
      endDate: existingClass.endDate,
    });

    return { message: '클래스 세션이 성공적으로 생성되었습니다.' };
  }

  // 특정 기간에 대한 세션 생성 메서드
  async generateSessionsForPeriod(
    classId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const existingClass = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      throw new NotFoundException('클래스를 찾을 수 없습니다.');
    }

    // 기존 세션 중 해당 기간과 겹치는 세션 삭제
    await this.prisma.classSession.deleteMany({
      where: {
        classId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 새로운 세션 생성
    await this.generateClassSessions(classId, {
      dayOfWeek: existingClass.dayOfWeek,
      startTime: existingClass.startTime.toTimeString().slice(0, 5),
      endTime: existingClass.endTime.toTimeString().slice(0, 5),
      startDate,
      endDate,
    });

    return {
      message: '지정된 기간의 클래스 세션이 성공적으로 생성되었습니다.',
    };
  }
}

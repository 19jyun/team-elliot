import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    description?: string;
    maxStudents?: number;
    tuitionFee: number;
    teacherId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    endDate: Date;
  }) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('선생님을 찾을 수 없습니다.');
    }

    const registrationMonth = new Date(data.startDate);
    registrationMonth.setDate(1);

    const registrationStartDate = new Date(data.startDate);
    registrationStartDate.setDate(registrationStartDate.getDate() - 14);

    const registrationEndDate = new Date(registrationStartDate);
    registrationEndDate.setDate(registrationEndDate.getDate() + 7);

    return this.prisma.class.create({
      data: {
        className: data.className,
        classCode: `BALLET-${data.dayOfWeek.substring(0, 3)}-${
          Math.floor(Math.random() * 1000) + 1
        }`,
        description: data.description,
        maxStudents: data.maxStudents,
        currentStudents: 0,
        tuitionFee: data.tuitionFee,
        dayOfWeek: data.dayOfWeek,
        startTime: new Date(`1970-01-01T${data.startTime}Z`),
        endTime: new Date(`1970-01-01T${data.endTime}Z`),
        startDate: data.startDate,
        endDate: data.endDate,
        level: 'BEGINNER',
        status: 'DRAFT',
        registrationMonth,
        registrationStartDate,
        registrationEndDate,
        teacher: {
          connect: {
            id: data.teacherId,
          },
        },
      },
    });
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
          startTime: new Date(`1970-01-01T${data.startTime}Z`),
        }),
        ...(data.endTime && {
          endTime: new Date(`1970-01-01T${data.endTime}Z`),
        }),
      },
    });
  }

  async deleteClass(id: number) {
    const existingClass = await this.prisma.class.findUnique({
      where: { id },
      include: { enrollments: true },
    });

    if (!existingClass) {
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    if (existingClass.enrollments.length > 0) {
      throw new BadRequestException('수강생이 있는 수업은 삭제할 수 없습니다.');
    }

    return this.prisma.class.delete({
      where: { id },
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

  async getClassesByMonth(month: string, year: number) {
    const targetDate = new Date(`${year}-${month}-01`);
    const nextMonth = new Date(targetDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return this.prisma.class.findMany({
      where: {
        AND: [
          {
            registrationMonth: {
              gte: targetDate,
              lt: nextMonth,
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
      },
    });
  }
}

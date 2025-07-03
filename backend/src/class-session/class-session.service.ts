import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createClassSession(data: {
    classId: number;
    date: Date;
    startTime: Date;
    endTime: Date;
  }) {
    return this.prisma.classSession.create({
      data,
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  async getClassSessions(classId: number) {
    return this.prisma.classSession.findMany({
      where: { classId },
      include: {
        enrollments: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getClassSession(id: number) {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            teacher: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    return session;
  }
}

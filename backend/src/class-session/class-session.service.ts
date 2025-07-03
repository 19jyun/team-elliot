import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  async enrollSession(sessionId: number, studentId: number) {
    // 세션이 존재하는지 확인
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: true,
      },
    });

    if (!session) {
      throw new NotFoundException('세션을 찾을 수 없습니다.');
    }

    // 이미 수강 신청했는지 확인
    const existingEnrollment = await this.prisma.sessionEnrollment.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('이미 수강 신청한 세션입니다.');
    }

    // SessionEnrollment 생성
    return this.prisma.sessionEnrollment.create({
      data: {
        studentId,
        sessionId,
        status: 'PENDING',
      },
      include: {
        session: {
          include: {
            class: {
              include: {
                teacher: true,
              },
            },
          },
        },
        student: true,
      },
    });
  }

  async batchEnrollSessions(sessionIds: number[], studentId: number) {
    const enrollments = [];

    for (const sessionId of sessionIds) {
      try {
        const enrollment = await this.enrollSession(sessionId, studentId);
        enrollments.push(enrollment);
      } catch (error) {
        console.error(`Failed to enroll session ${sessionId}:`, error.message);
      }
    }

    return {
      success: enrollments.length,
      total: sessionIds.length,
      enrollments,
    };
  }
}

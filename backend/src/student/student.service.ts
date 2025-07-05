import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
  ) {}

  async getStudentClasses(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
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
        sessionEnrollments: {
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
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // Get unique classes where student is enrolled in at least one session
    const enrolledClassIds = new Set(
      student.sessionEnrollments.map(
        (enrollment) => enrollment.session.class.id,
      ),
    );

    const enrollmentClasses = Array.from(enrolledClassIds).map((classId) => {
      const enrollment = student.sessionEnrollments.find(
        (e) => e.session.class.id === classId,
      );
      return enrollment.session.class;
    });

    // Get individual sessions with session_id and status
    const sessionClasses = student.sessionEnrollments.map((enrollment) => ({
      ...enrollment.session,
      session_id: enrollment.session.id,
      enrollment_status: enrollment.status || 'PENDING', // Assuming status field exists
      enrollment_id: enrollment.id,
    }));

    return {
      enrollmentClasses,
      sessionClasses,
    };
  }

  async getClassDetail(classId: number) {
    const class_ = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            introduction: true,
          },
        },
        enrollments: true,
      },
    });

    if (!class_) {
      throw new NotFoundException('수업을 찾을 수 없습니다.');
    }

    return class_;
  }

  async enrollClass(classId: number, studentId: number) {
    return this.classService.enrollStudent(classId, studentId);
  }

  async unenrollClass(classId: number, studentId: number) {
    return this.classService.unenrollStudent(classId, studentId);
  }
}

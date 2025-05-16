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
      },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    return student.enrollments.map((enrollment) => enrollment.class);
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

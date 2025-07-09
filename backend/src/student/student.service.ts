import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { AcademyService } from '../academy/academy.service';
import { JoinAcademyDto } from './dto/join-academy.dto';
import { LeaveAcademyDto } from './dto/leave-academy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
    private academyService: AcademyService,
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

  // 학원 관련 메서드들 - AcademyService 위임
  async getMyAcademies(studentId: number) {
    return this.academyService.getMyAcademies(studentId);
  }

  async joinAcademy(studentId: number, joinAcademyDto: JoinAcademyDto) {
    return this.academyService.joinAcademy(studentId, joinAcademyDto);
  }

  async leaveAcademy(studentId: number, leaveAcademyDto: LeaveAcademyDto) {
    return this.academyService.leaveAcademy(studentId, leaveAcademyDto);
  }

  async getMyProfile(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        emergencyContact: true,
        birthDate: true,
        notes: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    return {
      id: student.id,
      userId: student.userId,
      name: student.name,
      phoneNumber: student.phoneNumber,
      emergencyContact: student.emergencyContact,
      birthDate: student.birthDate,
      notes: student.notes,
      level: student.level,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  async updateMyProfile(studentId: number, updateProfileDto: UpdateProfileDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // 빈 문자열을 null로 변환하고 birthDate를 ISO 형식으로 변환
    const updateData = {
      name: updateProfileDto.name,
      phoneNumber: updateProfileDto.phoneNumber || null,
      emergencyContact: updateProfileDto.emergencyContact || null,
      birthDate:
        updateProfileDto.birthDate && updateProfileDto.birthDate.trim() !== ''
          ? new Date(updateProfileDto.birthDate).toISOString()
          : null,
      notes: updateProfileDto.notes || null,
      level: updateProfileDto.level || null,
      updatedAt: new Date(),
    };

    const updatedStudent = await this.prisma.student.update({
      where: { id: studentId },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        phoneNumber: true,
        emergencyContact: true,
        birthDate: true,
        notes: true,
        level: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: updatedStudent.id,
      userId: updatedStudent.userId,
      name: updatedStudent.name,
      phoneNumber: updatedStudent.phoneNumber,
      emergencyContact: updatedStudent.emergencyContact,
      birthDate: updatedStudent.birthDate,
      notes: updatedStudent.notes,
      level: updatedStudent.level,
      createdAt: updatedStudent.createdAt,
      updatedAt: updatedStudent.updatedAt,
    };
  }
}

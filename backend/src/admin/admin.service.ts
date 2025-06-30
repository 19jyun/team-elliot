import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcrypt';
import { CreateStudentDto, CreateTeacherDto, CreateClassDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createStudent(dto: CreateStudentDto) {
    const exists = await this.prisma.student.findUnique({
      where: { userId: dto.userId },
    });

    if (exists) {
      throw new BadRequestException('이미 존재하는 ID입니다.');
    }

    const hashedPassword = await hash(dto.password, 10);

    return this.prisma.student.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async createTeacher(dto: CreateTeacherDto) {
    const exists = await this.prisma.teacher.findUnique({
      where: { userId: dto.userId },
    });

    if (exists) {
      throw new BadRequestException('이미 존재하는 ID입니다.');
    }

    const hashedPassword = await hash(dto.password, 10);

    return this.prisma.teacher.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async createClass(dto: CreateClassDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
    });

    if (!teacher) {
      throw new BadRequestException('존재하지 않는 선생님입니다.');
    }

    const classCode = `BALLET-${dto.dayOfWeek.substring(0, 3)}-${
      Math.floor(Math.random() * 1000) + 1
    }`;

    const registrationMonth = new Date(dto.startDate);
    registrationMonth.setDate(1);

    const registrationStartDate = new Date(dto.startDate);
    registrationStartDate.setDate(registrationStartDate.getDate() - 14);

    const registrationEndDate = new Date(registrationStartDate);
    registrationEndDate.setDate(registrationEndDate.getDate() + 7);

    return this.prisma.class.create({
      data: {
        className: dto.className,
        classCode,
        description: dto.description,
        maxStudents: dto.maxStudents,
        currentStudents: 0,
        tuitionFee: dto.tuitionFee,
        dayOfWeek: dto.dayOfWeek,
        startTime: new Date(`1970-01-01T${dto.startTime}Z`),
        endTime: new Date(`1970-01-01T${dto.endTime}Z`),
        startDate: dto.startDate,
        endDate: dto.endDate,
        level: 'BEGINNER',
        status: 'DRAFT',
        registrationMonth,
        registrationStartDate,
        registrationEndDate,
        teacher: {
          connect: {
            id: dto.teacherId,
          },
        },
      },
    });
  }

  async getStudents() {
    return this.prisma.student.findMany();
  }

  async getTeachers() {
    return this.prisma.teacher.findMany();
  }

  async getClasses() {
    return this.prisma.class.findMany({
      include: {
        teacher: true,
      },
    });
  }

  async getWithdrawalStats() {
    const withdrawalHistories = await this.prisma.withdrawalHistory.findMany({
      orderBy: {
        withdrawalDate: 'desc',
      },
    });

    const stats = {
      total: withdrawalHistories.length,
      byReason: {
        DISSATISFACTION: 0,
        UNUSED: 0,
        PRIVACY: 0,
        OTHER: 0,
      },
      byRole: {
        STUDENT: 0,
        TEACHER: 0,
      },
    };

    withdrawalHistories.forEach((history) => {
      stats.byReason[history.reasonCategory]++;
      stats.byRole[history.userRole]++;
    });

    return stats;
  }

  async deleteStudent(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: true,
      },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // 트랜잭션으로 관련 데이터 모두 삭제
    await this.prisma.$transaction([
      // 수강 신청 내역 삭제
      this.prisma.enrollment.deleteMany({
        where: { studentId },
      }),
      // 학생 정보 삭제
      this.prisma.student.delete({
        where: { id: studentId },
      }),
    ]);

    return { message: '학생이 성공적으로 삭제되었습니다.' };
  }

  async deleteTeacher(id: number) {
    return this.prisma.teacher.delete({
      where: { id },
    });
  }

  async deleteClass(id: number) {
    return this.prisma.class.delete({
      where: { id },
    });
  }

  async resetStudentPassword(studentId: number, newPassword: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    const hashedPassword = await hash(newPassword, 10);

    await this.prisma.student.update({
      where: { id: studentId },
      data: { password: hashedPassword },
    });

    return { message: '비밀번호가 성공적으로 초기화되었습니다.' };
  }
}

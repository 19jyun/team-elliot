import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClassService } from '../class/class.service';
import { hash } from 'bcrypt';
import { CreateStudentDto, CreateTeacherDto, CreateClassDto } from './dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private classService: ClassService,
  ) {}

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

    // ClassService의 createClass 메서드를 사용하여 세션도 함께 생성
    return this.classService.createClass({
      className: dto.className,
      description: dto.description,
      maxStudents: dto.maxStudents,
      tuitionFee: dto.tuitionFee,
      teacherId: dto.teacherId,
      dayOfWeek: dto.dayOfWeek,
      level: dto.level,
      startTime: dto.startTime,
      endTime: dto.endTime,
      startDate: dto.startDate,
      endDate: dto.endDate,
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

    await this.prisma.$transaction([
      this.prisma.enrollment.deleteMany({
        where: { studentId },
      }),
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
    return this.classService.deleteClass(id);
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

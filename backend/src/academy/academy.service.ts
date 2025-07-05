import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademyDto, JoinAcademyDto, LeaveAcademyDto } from './dto';

@Injectable()
export class AcademyService {
  constructor(private prisma: PrismaService) {}

  // 학원 생성 (관리자)
  async createAcademy(dto: CreateAcademyDto) {
    const exists = await this.prisma.academy.findUnique({
      where: { code: dto.code },
    });
    if (exists) throw new ConflictException('이미 존재하는 학원 코드입니다.');
    return this.prisma.academy.create({ data: dto });
  }

  // 학원 삭제 (관리자)
  async deleteAcademy(academyId: number) {
    const academy = await this.prisma.academy.findUnique({
      where: { id: academyId },
      include: {
        classes: { include: { classSessions: true } },
        teachers: true,
        students: true,
      },
    });
    if (!academy) throw new NotFoundException('학원을 찾을 수 없습니다.');
    if (academy.teachers.length > 0)
      throw new BadRequestException('소속된 선생님이 있어 삭제할 수 없습니다.');
    if (academy.students.length > 0)
      throw new BadRequestException('가입된 학생이 있어 삭제할 수 없습니다.');
    await this.prisma.$transaction(async (tx) => {
      for (const c of academy.classes) {
        await tx.classSession.deleteMany({ where: { classId: c.id } });
      }
      await tx.class.deleteMany({ where: { academyId } });
      await tx.academy.delete({ where: { id: academyId } });
    });
    return { message: '학원이 성공적으로 삭제되었습니다.' };
  }

  // 학원 목록 (공통)
  async getAcademies() {
    return this.prisma.academy.findMany();
  }

  // 학원 상세 (공통)
  async getAcademyById(id: number) {
    const academy = await this.prisma.academy.findUnique({ where: { id } });
    if (!academy) throw new NotFoundException('학원을 찾을 수 없습니다.');
    return academy;
  }

  // 학원 가입 (학생)
  async joinAcademy(studentId: number, dto: JoinAcademyDto) {
    const academy = await this.prisma.academy.findUnique({
      where: { code: dto.code },
    });
    if (!academy)
      throw new NotFoundException('해당 코드의 학원을 찾을 수 없습니다.');
    const exists = await this.prisma.studentAcademy.findUnique({
      where: { studentId_academyId: { studentId, academyId: academy.id } },
    });
    if (exists) throw new ConflictException('이미 가입된 학원입니다.');
    await this.prisma.studentAcademy.create({
      data: { studentId, academyId: academy.id },
    });
    return { message: '학원 가입이 완료되었습니다.' };
  }

  // 학원 탈퇴 (학생)
  async leaveAcademy(studentId: number, dto: LeaveAcademyDto) {
    const exists = await this.prisma.studentAcademy.findUnique({
      where: { studentId_academyId: { studentId, academyId: dto.academyId } },
    });
    if (!exists) throw new BadRequestException('가입되지 않은 학원입니다.');
    await this.prisma.studentAcademy.delete({
      where: { studentId_academyId: { studentId, academyId: dto.academyId } },
    });
    return { message: '학원 탈퇴가 완료되었습니다.' };
  }

  // 내가 가입한 학원 목록 (학생)
  async getMyAcademies(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        academies: {
          include: { academy: true },
        },
      },
    });
    if (!student) throw new NotFoundException('학생을 찾을 수 없습니다.');
    return student.academies.map((sa) => sa.academy);
  }
}

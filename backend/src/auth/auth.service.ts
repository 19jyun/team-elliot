import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string, password: string) {
    // admin 체크
    const admin = await this.prisma.user.findFirst({
      where: {
        userId: userId,
        role: 'ADMIN',
      },
      select: {
        id: true,
        userId: true,
        password: true,
        name: true,
        role: true,
      },
    });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }

    // teacher 체크
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        userId: userId,
      },
    });

    if (teacher && (await bcrypt.compare(password, teacher.password))) {
      const { password, ...result } = teacher;
      return { ...result, role: 'TEACHER' };
    }

    // student 체크
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (student && (await bcrypt.compare(password, student.password))) {
      const { password, ...result } = student;
      return { ...result, role: 'STUDENT' };
    }

    throw new UnauthorizedException(
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  async login(userId: string, password: string) {
    const user = await this.validateUser(userId, password);
    const payload = { userId: user.userId, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    // 아이디 중복 체크 (학생 + 선생님 테이블 모두 확인)
    const existingStudent = await this.prisma.student.findUnique({
      where: { userId: signupDto.userId },
    });
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { userId: signupDto.userId },
    });

    if (existingStudent || existingTeacher) {
      throw new ConflictException('이미 사용중인 아이디입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    if (signupDto.role === 'STUDENT') {
      // 학생 생성
      const student = await this.prisma.student.create({
        data: {
          userId: signupDto.userId,
          password: hashedPassword,
          name: signupDto.name,
          phoneNumber: signupDto.phoneNumber,
        },
      });

      // JWT 토큰 생성
      const token = this.jwtService.sign({
        id: student.id,
        userId: student.userId,
        role: 'STUDENT',
      });

      return {
        access_token: token,
        user: {
          id: student.id,
          userId: student.userId,
          name: student.name,
          role: 'STUDENT',
        },
      };
    } else {
      // 선생님 생성 (academyId는 null로 시작)
      const teacher = await this.prisma.teacher.create({
        data: {
          userId: signupDto.userId,
          password: hashedPassword,
          name: signupDto.name,
          phoneNumber: signupDto.phoneNumber,
          academyId: null, // 학원 소속 없이 시작
        },
      });

      // JWT 토큰 생성
      const token = this.jwtService.sign({
        id: teacher.id,
        userId: teacher.userId,
        role: 'TEACHER',
      });

      return {
        access_token: token,
        user: {
          id: teacher.id,
          userId: teacher.userId,
          name: teacher.name,
          role: 'TEACHER',
        },
      };
    }
  }

  async withdrawal(userId: number, reason: string) {
    const user = await this.prisma.student.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.prisma.withdrawalHistory.create({
      data: {
        userId: user.userId,
        userName: user.name,
        userRole: 'STUDENT',
        reason: reason,
        reasonCategory: 'OTHER',
      },
    });

    // 사용자 관련 데이터 삭제
    await this.prisma.$transaction([
      // 수강 신청 내역 삭제
      this.prisma.enrollment.deleteMany({
        where: { studentId: userId },
      }),
      // 학생 정보 삭제
      this.prisma.student.delete({
        where: { id: userId },
      }),
    ]);
  }

  async checkUserId(userId: string): Promise<{ available: boolean }> {
    const existingUser = await this.prisma.student.findFirst({
      where: {
        userId: userId,
      },
    });

    return {
      available: !existingUser, // existingUser가 null이면 true (사용 가능), 아니면 false (사용 불가)
    };
  }
}

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
    // principal 체크
    const principal = await this.prisma.principal.findUnique({
      where: {
        userId: userId,
      },
    });

    if (principal && (await bcrypt.compare(password, principal.password))) {
      // User 테이블에서 해당 userId를 찾아서 User의 id를 사용
      const user = await this.prisma.user.findUnique({
        where: { userId: userId },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = principal;
      return {
        ...result,
        role: 'PRINCIPAL',
        id: user ? user.id : principal.id, // User 테이블에 있으면 User의 id, 없으면 Principal의 id
      };
    }

    // teacher 체크
    const teacher = await this.prisma.teacher.findUnique({
      where: {
        userId: userId,
      },
    });

    if (teacher && (await bcrypt.compare(password, teacher.password))) {
      // User 테이블에서 해당 userId를 찾아서 User의 id를 사용
      const user = await this.prisma.user.findUnique({
        where: { userId: userId },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = teacher;
      return {
        ...result,
        role: 'TEACHER',
        id: user ? user.id : teacher.id, // User 테이블에 있으면 User의 id, 없으면 Teacher의 id
      };
    }

    // student 체크
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });
    if (student && (await bcrypt.compare(password, student.password))) {
      // User 테이블에서 해당 userId를 찾아서 User의 id를 사용
      const user = await this.prisma.user.findUnique({
        where: { userId: userId },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = student;
      return {
        ...result,
        role: 'STUDENT',
        id: user ? user.id : student.id, // User 테이블에 있으면 User의 id, 없으면 Student의 id
      };
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
    // 아이디 중복 체크 (학생 + 선생님 + 원장 + User 테이블 모두 확인)
    const existingStudent = await this.prisma.student.findUnique({
      where: { userId: signupDto.userId },
    });
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { userId: signupDto.userId },
    });
    const existingPrincipal = await this.prisma.principal.findUnique({
      where: { userId: signupDto.userId },
    });
    const existingUser = await this.prisma.user.findUnique({
      where: { userId: signupDto.userId },
    });

    if (
      existingStudent ||
      existingTeacher ||
      existingPrincipal ||
      existingUser
    ) {
      throw new ConflictException('이미 사용중인 아이디입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    if (signupDto.role === 'STUDENT') {
      // 트랜잭션으로 Student 회원가입 처리
      const result = await this.prisma.$transaction(async (prisma) => {
        // Student 생성
        const student = await prisma.student.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            phoneNumber: signupDto.phoneNumber,
          },
        });

        // User 테이블에도 생성
        const user = await prisma.user.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            role: 'STUDENT',
          },
        });

        return { student, user };
      });

      if (!result || !result.user || !result.student) {
        throw new Error('Student 회원가입 중 오류가 발생했습니다.');
      }

      // JWT 토큰 생성 (User 테이블의 id 사용)
      const token = this.jwtService.sign({
        sub: result.user.id,
        userId: result.student.userId,
        role: 'STUDENT',
      });

      return {
        access_token: token,
        user: {
          id: result.user.id,
          userId: result.student.userId,
          name: result.student.name,
          role: 'STUDENT',
        },
      };
    } else if (signupDto.role === 'TEACHER') {
      // 트랜잭션으로 Teacher 회원가입 처리
      const result = await this.prisma.$transaction(async (prisma) => {
        // Teacher 생성 (academyId는 null로 시작)
        const teacher = await prisma.teacher.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            phoneNumber: signupDto.phoneNumber,
            academyId: null, // 학원 소속 없이 시작
          },
        });

        // User 테이블에도 생성
        const user = await prisma.user.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            role: 'TEACHER',
          },
        });

        return { teacher, user };
      });

      if (!result || !result.user || !result.teacher) {
        throw new Error('Teacher 회원가입 중 오류가 발생했습니다.');
      }

      // JWT 토큰 생성 (User 테이블의 id 사용)
      const token = this.jwtService.sign({
        sub: result.user.id,
        userId: result.teacher.userId,
        role: 'TEACHER',
      });

      return {
        access_token: token,
        user: {
          id: result.user.id,
          userId: result.teacher.userId,
          name: result.teacher.name,
          role: 'TEACHER',
        },
      };
    } else if (signupDto.role === 'PRINCIPAL') {
      // 트랜잭션으로 Principal 회원가입 처리
      const result = await this.prisma.$transaction(async (prisma) => {
        // Principal이 회원가입할 때 자동으로 학원 생성
        const academy = await prisma.academy.create({
          data: {
            name: `${signupDto.name}의 발레 학원`,
            phoneNumber: signupDto.phoneNumber,
            address: '주소를 설정해주세요',
            description: '발레 학원입니다.',
            code: `ACADEMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 5)}_${Math.random().toString(36).substr(2, 3)}`,
          },
        });

        // Principal 생성
        const principal = await prisma.principal.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            phoneNumber: signupDto.phoneNumber,
            academyId: academy.id,
          },
        });

        // User 테이블에도 생성
        const user = await prisma.user.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            role: 'PRINCIPAL',
          },
        });

        return { academy, principal, user };
      });

      if (!result || !result.user || !result.principal || !result.academy) {
        throw new Error('Principal 회원가입 중 오류가 발생했습니다.');
      }

      // JWT 토큰 생성 (User 테이블의 id 사용)
      const token = this.jwtService.sign({
        sub: result.user.id,
        userId: result.principal.userId,
        role: 'PRINCIPAL',
      });

      return {
        access_token: token,
        user: {
          id: result.user.id,
          userId: result.principal.userId,
          name: result.principal.name,
          role: 'PRINCIPAL',
        },
      };
    } else {
      throw new BadRequestException('지원하지 않는 역할입니다.');
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

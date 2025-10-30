import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { AuthenticatedUser } from './types/auth.types';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { PrincipalSignupDto } from './dto/principal-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private withdrawalService: WithdrawalService,
  ) {}

  async validateUser(userId: string, password: string) {
    // User 테이블에서 먼저 찾기
    const user = await this.prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 비밀번호 확인
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException({
        code: 'INVALID_PASSWORD',
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 역할에 따라 해당 테이블에서 추가 정보 가져오기
    if (user.role === 'PRINCIPAL') {
      const principal = await this.prisma.principal.findUnique({
        where: { userRefId: user.id },
      });
      if (!principal) {
        throw new UnauthorizedException({
          code: 'PRINCIPAL_NOT_FOUND',
          message: 'Principal 정보를 찾을 수 없습니다.',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = principal;
      return {
        ...result,
        role: 'PRINCIPAL',
        id: user.id,
      };
    } else if (user.role === 'TEACHER') {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userRefId: user.id },
      });
      if (!teacher) {
        throw new UnauthorizedException({
          code: 'TEACHER_NOT_FOUND',
          message: 'Teacher 정보를 찾을 수 없습니다.',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = teacher;
      return {
        ...result,
        role: 'TEACHER',
        id: user.id,
      };
    } else if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userRefId: user.id },
      });
      if (!student) {
        throw new UnauthorizedException({
          code: 'STUDENT_NOT_FOUND',
          message: 'Student 정보를 찾을 수 없습니다.',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = student;
      return {
        ...result,
        role: 'STUDENT',
        id: user.id,
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

  async refreshToken(userId: string) {
    // 사용자 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 새로운 JWT 토큰 생성
    const payload = { userId: user.userId, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      expires_in: 2 * 60 * 60, // 2시간 (초 단위)
      token_type: 'Bearer',
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    };
  }

  async signup(signupDto: SignupDto) {
    // 아이디 중복 체크 (User 테이블만 확인)
    const existingUser = await this.prisma.user.findUnique({
      where: { userId: signupDto.userId },
    });

    if (existingUser) {
      throw new ConflictException({
        code: 'USER_ID_ALREADY_EXISTS',
        message: '이미 사용중인 아이디입니다.',
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    if (signupDto.role === 'STUDENT') {
      // 트랜잭션으로 Student 회원가입 처리
      const result = await this.prisma.$transaction(async (prisma) => {
        // User 테이블에 먼저 생성
        const user = await prisma.user.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            role: 'STUDENT',
          },
        });

        // Student 생성 (userRefId 연결)
        const student = await prisma.student.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            phoneNumber: signupDto.phoneNumber,
            userRefId: user.id,
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
        // User 테이블에 먼저 생성
        const user = await prisma.user.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            role: 'TEACHER',
          },
        });

        // Teacher 생성 (userRefId 연결, academyId는 null로 시작)
        const teacher = await prisma.teacher.create({
          data: {
            userId: signupDto.userId,
            password: hashedPassword,
            name: signupDto.name,
            phoneNumber: signupDto.phoneNumber,
            userRefId: user.id,
            academyId: null, // 학원 소속 없이 시작
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
    } else {
      throw new BadRequestException(
        '지원하지 않는 역할입니다. Principal 회원가입은 /auth/signup/principal 엔드포인트를 사용하세요.',
      );
    }
  }

  /**
   * Principal 전용 회원가입 (학원 정보 포함)
   */
  async signupPrincipal(signupDto: PrincipalSignupDto) {
    // 아이디 중복 체크 (User 테이블만 확인)
    const existingUser = await this.prisma.user.findUnique({
      where: { userId: signupDto.userId },
    });

    if (existingUser) {
      throw new ConflictException({
        code: 'USER_ID_ALREADY_EXISTS',
        message: '이미 사용중인 아이디입니다.',
      });
    }

    // 학원 코드 중복 체크
    const academyCode = this.generateAcademyCode();
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { code: academyCode },
    });

    if (existingAcademy) {
      // 매우 낮은 확률이지만 중복 시 재시도
      return this.signupPrincipal(signupDto);
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    // 트랜잭션으로 Principal + Academy 생성
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. User 테이블에 먼저 생성
      const user = await prisma.user.create({
        data: {
          userId: signupDto.userId,
          password: hashedPassword,
          name: signupDto.name,
          role: 'PRINCIPAL',
        },
      });

      // 2. Academy 생성 (사용자 입력 정보 사용)
      const academy = await prisma.academy.create({
        data: {
          name: signupDto.academyInfo.name,
          phoneNumber: signupDto.academyInfo.phoneNumber,
          address: signupDto.academyInfo.address,
          description: signupDto.academyInfo.description,
          code: academyCode,
        },
      });

      // 3. Principal 생성 (userRefId와 academyId 연결)
      const principal = await prisma.principal.create({
        data: {
          userId: signupDto.userId,
          password: hashedPassword,
          name: signupDto.name,
          phoneNumber: signupDto.phoneNumber,
          userRefId: user.id,
          academyId: academy.id,
        },
      });

      return { user, academy, principal };
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
      academy: {
        id: result.academy.id,
        name: result.academy.name,
        code: result.academy.code,
      },
    };
  }

  /**
   * 고유한 학원 코드 생성
   */
  private generateAcademyCode(): string {
    const timestamp = Date.now();
    const random1 = Math.random().toString(36).substr(2, 9);
    const random2 = Math.random().toString(36).substr(2, 5);
    const random3 = Math.random().toString(36).substr(2, 3);
    return `ACADEMY_${timestamp}_${random1}_${random2}_${random3}`;
  }

  async withdrawal(userId: number, reason: string) {
    // WithdrawalService를 사용하여 회원 탈퇴 처리
    await this.withdrawalService.withdrawStudent(userId, reason);
  }

  async checkUserId(userId: string): Promise<{ available: boolean }> {
    const existingUser = await this.prisma.user.findFirst({
      where: { userId: userId },
    });

    return {
      available: !existingUser, // existingUser가 null이면 true (사용 가능), 아니면 false (사용 불가)
    };
  }

  async getSession(user: AuthenticatedUser) {
    // 사용자 정보를 데이터베이스에서 조회하여 name 필드 포함
    const userInfo = await this.prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: { id: true, userId: true, name: true, role: true },
    });

    if (!userInfo) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 새로운 JWT 토큰 생성 (현재 토큰과 동일한 구조)
    const payload = {
      userId: userInfo.userId,
      sub: userInfo.id,
      role: userInfo.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: userInfo.id,
        userId: userInfo.userId,
        name: userInfo.name,
        role: userInfo.role,
      },
      accessToken,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2시간 후 만료
    };
  }

  async verifyToken(user: AuthenticatedUser) {
    // 사용자 정보를 데이터베이스에서 조회하여 name 필드 포함
    const userInfo = await this.prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: { id: true, userId: true, name: true, role: true },
    });

    if (!userInfo) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return {
      valid: true,
      user: {
        id: userInfo.id,
        userId: userInfo.userId,
        name: userInfo.name,
        role: userInfo.role,
      },
    };
  }
}

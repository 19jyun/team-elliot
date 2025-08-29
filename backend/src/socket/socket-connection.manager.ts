import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocketConnectionManager {
  private readonly connectedClients = new Map<
    string,
    {
      socket: Socket;
      userId: number;
      role: string;
      academyId?: number;
      classIds: number[];
    }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      this.logger.log(`🔌 클라이언트 연결 시도: ${client.id}`);

      // JWT 토큰 검증
      const token = client.handshake.auth.token;
      if (!token) {
        this.logger.warn(`❌ 토큰 없음: ${client.id}`);
        throw new UnauthorizedException({
          code: 'TOKEN_MISSING',
          message: '인증 토큰이 없습니다.',
          details: { clientId: client.id },
        });
      }

      if (typeof token !== 'string') {
        this.logger.warn(`❌ 유효하지 않은 토큰 형식: ${client.id}`);
        throw new BadRequestException({
          code: 'INVALID_TOKEN_FORMAT',
          message: '유효하지 않은 토큰 형식입니다.',
          details: { clientId: client.id, tokenType: typeof token },
        });
      }

      let decoded;
      try {
        decoded = this.jwtService.verify(token);
      } catch (jwtError) {
        this.logger.warn(`❌ JWT 토큰 검증 실패: ${client.id}`, jwtError);
        throw new UnauthorizedException({
          code: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.',
          details: { clientId: client.id, error: jwtError.message },
        });
      }

      const userId = decoded.sub;
      const role = decoded.role;

      if (!userId || !role) {
        this.logger.warn(`❌ 토큰에 필수 정보 누락: ${client.id}`);
        throw new BadRequestException({
          code: 'INCOMPLETE_TOKEN',
          message: '토큰에 필수 정보가 누락되었습니다.',
          details: { clientId: client.id, userId, role },
        });
      }

      // 사용자 정보 조회
      const user = await this.getUserInfo(userId, role);
      if (!user) {
        this.logger.warn(`❌ 사용자 정보 없음: ${client.id}`);
        throw new BadRequestException({
          code: 'USER_NOT_FOUND',
          message: '사용자 정보를 찾을 수 없습니다.',
          details: { clientId: client.id, userId, role },
        });
      }

      // 클라이언트 정보 저장
      this.connectedClients.set(client.id, {
        socket: client,
        userId,
        role,
        academyId: user.academyId,
        classIds: user.classIds || [],
      });

      // 역할별 룸에 조인
      await client.join(`role:${role}`);
      await client.join(`user:${userId}`);

      // 학원이 있으면 학원 룸에 조인
      if (user.academyId) {
        await client.join(`academy:${user.academyId}`);
      }

      // 담당 클래스가 있으면 클래스 룸에 조인
      user.classIds?.forEach((classId) => {
        client.join(`class:${classId}`);
      });

      this.logger.log(
        `✅ 클라이언트 연결 성공: ${client.id} (사용자: ${userId}, 역할: ${role})`,
      );

      // 연결 확인 이벤트 전송
      client.emit('connection_confirmed', {
        userId,
        role,
        message: '소켓 연결이 성공적으로 설정되었습니다.',
      });
    } catch (error) {
      this.logger.error(`❌ 클라이언트 연결 실패: ${client.id}`, error);

      // 에러 정보를 클라이언트에게 전송
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        client.emit('connection_error', {
          code: error.getResponse()['code'] || 'CONNECTION_ERROR',
          message: error.getResponse()['message'] || '연결에 실패했습니다.',
        });
      }

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`🔌 클라이언트 연결 해제: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  private async getUserInfo(userId: number, role: string) {
    if (!userId || userId <= 0) {
      throw new BadRequestException({
        code: 'INVALID_USER_ID',
        message: '유효하지 않은 사용자 ID입니다.',
        details: { userId },
      });
    }

    if (!role || typeof role !== 'string') {
      throw new BadRequestException({
        code: 'INVALID_ROLE',
        message: '유효하지 않은 역할입니다.',
        details: { role },
      });
    }

    switch (role) {
      case 'STUDENT':
        return this.getStudentInfo(userId);
      case 'TEACHER':
        return this.getTeacherInfo(userId);
      case 'PRINCIPAL':
        return this.getPrincipalInfo(userId);
      default:
        throw new BadRequestException({
          code: 'UNKNOWN_ROLE',
          message: '알 수 없는 역할입니다.',
          details: { role, validRoles: ['STUDENT', 'TEACHER', 'PRINCIPAL'] },
        });
    }
  }

  private async getStudentInfo(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userRefId: userId },
      include: {
        academies: {
          include: { academy: true },
        },
        enrollments: {
          include: { class: true },
        },
      },
    });

    if (!student) return null;

    return {
      academyId: student.academies[0]?.academyId,
      classIds: student.enrollments.map((e) => e.classId),
    };
  }

  private async getTeacherInfo(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userRefId: userId },
      include: {
        academy: true,
        classes: true,
      },
    });

    if (!teacher) return null;

    return {
      academyId: teacher.academyId,
      classIds: teacher.classes.map((c) => c.id),
    };
  }

  private async getPrincipalInfo(userId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { userRefId: userId },
      include: { academy: true },
    });

    if (!principal) return null;

    return {
      academyId: principal.academyId,
      classIds: [], // 원장은 모든 클래스에 접근 가능
    };
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getClientInfo(clientId: string) {
    return this.connectedClients.get(clientId);
  }
}

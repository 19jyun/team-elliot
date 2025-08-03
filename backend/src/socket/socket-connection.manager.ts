import { Injectable, Logger } from '@nestjs/common';
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
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      const role = decoded.role;

      // 사용자 정보 조회
      const user = await this.getUserInfo(userId, role);
      if (!user) {
        this.logger.warn(`❌ 사용자 정보 없음: ${client.id}`);
        client.disconnect();
        return;
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
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`🔌 클라이언트 연결 해제: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  private async getUserInfo(userId: number, role: string) {
    switch (role) {
      case 'STUDENT':
        return this.getStudentInfo(userId);
      case 'TEACHER':
        return this.getTeacherInfo(userId);
      case 'PRINCIPAL':
        return this.getPrincipalInfo(userId);
      default:
        return null;
    }
  }

  private async getStudentInfo(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
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

  private async getTeacherInfo(teacherId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
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

  private async getPrincipalInfo(principalId: number) {
    const principal = await this.prisma.principal.findUnique({
      where: { id: principalId },
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

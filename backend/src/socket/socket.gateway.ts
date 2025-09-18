import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000', // 로컬 개발
      'https://team-elliot-git-main-junghun-yuns-projects.vercel.app',
      'https://team-elliot-eight.vercel.app',
      'https://team-elliot-pvv8c9z07-junghun-yuns-projects.vercel.app',
      process.env.FRONTEND_URL, // 환경변수로 설정된 URL
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // 연결된 클라이언트들을 저장
  private connectedClients: Map<
    string,
    { socket: Socket; userId: number; role: string }
  > = new Map();

  // 클라이언트 연결 시
  async handleConnection(client: Socket) {
    try {
      console.log(`🔌 클라이언트 연결 시도: ${client.id}`);

      // JWT 토큰 검증 (handshake.auth.token에서 가져옴)
      const token = client.handshake.auth.token;
      console.log(`🔍 토큰 확인: ${token ? '토큰 있음' : '토큰 없음'}`);

      if (!token) {
        console.log(`❌ 토큰 없음: ${client.id}`);
        client.disconnect();
        return;
      }

      console.log(`🔍 토큰 길이: ${token.length}`);

      // JWT 토큰 검증 및 디코딩
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      const role = decoded.role;

      console.log(`🔍 토큰 검증 결과: userId=${userId}, role=${role}`);
      console.log(`🔍 전체 디코딩 결과:`, decoded);

      // 클라이언트 정보 저장
      this.connectedClients.set(client.id, {
        socket: client,
        userId,
        role,
      });

      // 역할별 룸에 조인
      await client.join(`role:${role}`);
      await client.join(`user:${userId}`);

      // 학원 정보가 있으면 학원 룸에도 조인
      if (role === 'PRINCIPAL' || role === 'TEACHER') {
        const user = await this.getUserInfo(userId, role);
        if (user?.academyId) {
          await client.join(`academy:${user.academyId}`);
          console.log(`🏫 학원 룸 조인: academy:${user.academyId}`);
        } else {
          console.log(`⚠️ 학원 정보 없음: userId=${userId}, role=${role}`);
        }
      }

      console.log(
        `✅ 클라이언트 연결 성공: ${client.id} (사용자: ${userId}, 역할: ${role})`,
      );

      // 연결 확인 이벤트 전송
      client.emit('connection_confirmed', {
        userId,
        role,
        message: '소켓 연결이 성공적으로 설정되었습니다.',
      });
    } catch (error) {
      console.error(`❌ 클라이언트 연결 실패: ${client.id}`, error);

      // JWT 토큰 관련 에러 처리
      if (error.name === 'TokenExpiredError') {
        console.log(`⏰ 토큰 만료: ${client.id}`);
        // 토큰 만료 시 클라이언트에게 구체적인 에러 전송
        client.emit('auth_error', {
          type: 'TOKEN_EXPIRED',
          message: '토큰이 만료되었습니다. 다시 로그인해주세요.',
          code: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt,
        });
      } else if (error.name === 'JsonWebTokenError') {
        console.log(`🔒 잘못된 토큰: ${client.id}`);
        // 잘못된 토큰 시
        client.emit('auth_error', {
          type: 'INVALID_TOKEN',
          message: '유효하지 않은 토큰입니다.',
          code: 'INVALID_TOKEN',
        });
      } else {
        console.log(`❓ 기타 인증 오류: ${client.id}`, error.message);
        // 기타 인증 오류
        client.emit('auth_error', {
          type: 'AUTH_ERROR',
          message: '인증 중 오류가 발생했습니다.',
          code: 'AUTH_ERROR',
        });
      }

      client.disconnect();
    }
  }

  // 클라이언트 연결 해제 시
  handleDisconnect(client: Socket) {
    console.log(`🔌 클라이언트 연결 해제: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // 새로운 수강신청 요청 알림
  notifyNewEnrollmentRequest(
    enrollmentId: number,
    studentId: number,
    sessionId: number,
    academyId: number,
  ) {
    console.log(`📢 새로운 수강신청 요청 알림: ${enrollmentId}`);

    // 해당 학원의 원장과 선생님들에게 알림
    this.server.to(`academy:${academyId}`).emit('new_enrollment_request', {
      enrollmentId,
      studentId,
      sessionId,
      academyId,
      timestamp: new Date().toISOString(),
    });
  }

  // 새로운 환불 요청 알림
  notifyNewRefundRequest(
    refundId: number,
    studentId: number,
    sessionId: number,
    academyId: number,
  ) {
    console.log(`📢 새로운 환불 요청 알림: ${refundId}`);

    // 해당 학원의 원장과 선생님들에게 알림
    this.server.to(`academy:${academyId}`).emit('new_refund_request', {
      refundId,
      studentId,
      sessionId,
      academyId,
      timestamp: new Date().toISOString(),
    });
  }

  // 수강신청 승인 알림
  notifyEnrollmentAccepted(
    enrollmentId: number,
    studentUserRefId: number,
    sessionId?: number,
  ) {
    console.log(`📢 수강신청 승인 알림: ${enrollmentId}`);

    // 해당 학생에게 알림
    this.server.to(`user:${studentUserRefId}`).emit('enrollment_accepted', {
      enrollmentId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // 수강신청 거절 알림
  notifyEnrollmentRejected(
    enrollmentId: number,
    studentUserRefId: number,
    sessionId?: number,
  ) {
    console.log(`📢 수강신청 거절 알림: ${enrollmentId}`);

    // 해당 학생에게 알림
    this.server.to(`user:${studentUserRefId}`).emit('enrollment_rejected', {
      enrollmentId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // 환불 요청 승인 알림
  notifyRefundAccepted(
    refundId: number,
    studentUserRefId: number,
    sessionId?: number,
  ) {
    console.log(`📢 환불 요청 승인 알림: ${refundId}`);

    // 해당 학생에게 알림
    this.server.to(`user:${studentUserRefId}`).emit('refund_accepted', {
      refundId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // 환불 요청 거절 알림
  notifyRefundRejected(
    refundId: number,
    studentUserRefId: number,
    sessionId?: number,
  ) {
    console.log(`📢 환불 요청 거절 알림: ${refundId}`);

    // 해당 학생에게 알림
    this.server.to(`user:${studentUserRefId}`).emit('refund_rejected', {
      refundId,
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  // 학원 룸 참가
  @SubscribeMessage('join_academy_room')
  handleJoinAcademyRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { academyId: number },
  ) {
    console.log(`🏫 학원 룸 참가: ${client.id} -> academy:${data.academyId}`);
    client.join(`academy:${data.academyId}`);
  }

  // 학원 룸 나가기
  @SubscribeMessage('leave_academy_room')
  handleLeaveAcademyRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { academyId: number },
  ) {
    console.log(`🏫 학원 룸 나가기: ${client.id} -> academy:${data.academyId}`);
    client.leave(`academy:${data.academyId}`);
  }

  // 연결된 클라이언트 수 반환
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // 특정 사용자에게 이벤트 전송
  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // 특정 역할에게 이벤트 전송
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  // 사용자 정보 조회
  private async getUserInfo(
    userId: number,
    role: string,
  ): Promise<{ id: number; academyId?: number } | null> {
    try {
      switch (role) {
        case 'PRINCIPAL':
          return await this.prisma.principal.findUnique({
            where: { userRefId: userId },
            select: { id: true, academyId: true },
          });
        case 'TEACHER':
          return await this.prisma.teacher.findUnique({
            where: { userRefId: userId },
            select: { id: true, academyId: true },
          });
        case 'STUDENT':
          return await this.prisma.student.findUnique({
            where: { userRefId: userId },
            select: { id: true },
          });
        default:
          return null;
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  }
}

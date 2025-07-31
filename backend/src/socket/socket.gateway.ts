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
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
      if (!token) {
        console.log(`❌ 토큰 없음: ${client.id}`);
        client.disconnect();
        return;
      }

      // TODO: JWT 토큰 검증 로직 구현
      // const decoded = this.jwtService.verify(token);
      // const userId = decoded.sub;
      // const role = decoded.role;

      // 임시로 하드코딩된 사용자 정보 사용
      const userId = 7;
      const role = 'PRINCIPAL';

      // 클라이언트 정보 저장
      this.connectedClients.set(client.id, {
        socket: client,
        userId,
        role,
      });

      // 역할별 룸에 조인
      await client.join(`role:${role}`);
      await client.join(`user:${userId}`);

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
      client.disconnect();
    }
  }

  // 클라이언트 연결 해제 시
  handleDisconnect(client: Socket) {
    console.log(`🔌 클라이언트 연결 해제: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // 수강신청 상태 변경 알림
  notifyEnrollmentStatusChange(
    enrollmentId: number,
    status: string,
    data: any,
  ) {
    console.log(`📢 수강신청 상태 변경 알림: ${enrollmentId} -> ${status}`);

    // Principal들에게 알림
    this.server.to('role:PRINCIPAL').emit('enrollment_status_changed', {
      enrollmentId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 환불 요청 상태 변경 알림
  notifyRefundRequestStatusChange(refundId: number, status: string, data: any) {
    console.log(`📢 환불 요청 상태 변경 알림: ${refundId} -> ${status}`);

    // Principal들에게 알림
    this.server.to('role:PRINCIPAL').emit('refund_request_status_changed', {
      refundId,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 클래스 정보 변경 알림
  notifyClassInfoChange(classId: number, data: any) {
    console.log(`📢 클래스 정보 변경 알림: ${classId}`);

    // Principal들에게 알림
    this.server.to('role:PRINCIPAL').emit('class_info_changed', {
      classId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 학원 정보 변경 알림
  notifyAcademyInfoChange(academyId: number, data: any) {
    console.log(`📢 학원 정보 변경 알림: ${academyId}`);

    // Principal들에게 알림
    this.server.to('role:PRINCIPAL').emit('academy_info_changed', {
      academyId,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  // 수업 시간 알림 (30분 전)
  notifyClassReminder(classId: number, classData: any) {
    console.log(`📢 수업 시간 알림: ${classId}`);

    // 해당 클래스의 학생들에게 알림
    this.server.to(`class:${classId}`).emit('class_reminder', {
      classId,
      classData,
      message: '30분 후 수업이 시작됩니다.',
      timestamp: new Date().toISOString(),
    });
  }

  // 클라이언트로부터 메시지 수신
  @SubscribeMessage('join_class_room')
  handleJoinClassRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { classId: number },
  ) {
    const { classId } = data;
    client.join(`class:${classId}`);
    console.log(`👥 클라이언트 ${client.id}가 클래스 ${classId} 룸에 참가`);
  }

  @SubscribeMessage('leave_class_room')
  handleLeaveClassRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { classId: number },
  ) {
    const { classId } = data;
    client.leave(`class:${classId}`);
    console.log(`👥 클라이언트 ${client.id}가 클래스 ${classId} 룸에서 나감`);
  }

  // 연결 상태 확인
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // 현재 연결된 클라이언트 수 반환
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // 특정 사용자에게 직접 메시지 전송
  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // 특정 역할의 사용자들에게 메시지 전송
  sendToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }
}

// Redux AppDispatch 타입 import
import type { AppDispatch } from "@/store";

// Socket.IO 이벤트 타입 정의 (백엔드에 정의된 이벤트만)
export interface SocketEvents {
  // 연결 관련
  connection_confirmed: {
    userId: number;
    role: string;
    message: string;
  };

  // 새로운 수강신청 요청 (수강생 → 원장/선생님)
  new_enrollment_request: {
    enrollmentId: number;
    studentId: number;
    sessionId: number;
    academyId: number;
    timestamp: string;
  };

  // 새로운 환불 요청 (수강생 → 원장/선생님)
  new_refund_request: {
    refundId: number;
    studentId: number;
    sessionId: number;
    academyId: number;
    timestamp: string;
  };

  // 수강신청 승인 (원장/선생님 → 수강생)
  enrollment_accepted: {
    enrollmentId: number;
    sessionId?: number;
    timestamp: string;
  };

  // 수강신청 거절 (원장/선생님 → 수강생)
  enrollment_rejected: {
    enrollmentId: number;
    sessionId?: number;
    timestamp: string;
  };

  // 환불 요청 승인 (원장/선생님 → 수강생)
  refund_accepted: {
    refundId: number;
    sessionId?: number;
    timestamp: string;
  };

  // 환불 요청 거절 (원장/선생님 → 수강생)
  refund_rejected: {
    refundId: number;
    timestamp: string;
  };
}

// 클라이언트에서 서버로 보내는 이벤트 타입
export interface ClientSocketEvents {
  // 학원 룸 참가/나가기
  join_academy_room: { academyId: number };
  leave_academy_room: { academyId: number };
}

// Socket 이벤트 타입 추출
export type SocketEventName = keyof SocketEvents;
export type ClientEventName = keyof ClientSocketEvents;

// Socket 이벤트 데이터 타입
export type SocketEventData<T extends SocketEventName> = SocketEvents[T];
export type ClientEventData<T extends ClientEventName> = ClientSocketEvents[T];

// Socket 이벤트 핸들러 타입
export type SocketEventHandler<T extends SocketEventName> = (
  dispatch: AppDispatch,
  data: SocketEventData<T>
) => void;

// 역할별 이벤트 핸들러 맵 타입
export interface RoleEventHandlers {
  [eventName: string]: (
    dispatch: AppDispatch,
    data: SocketEventData<SocketEventName>
  ) => void;
}

// 전체 역할별 이벤트 핸들러 타입
export interface RoleBasedEventHandlers {
  PRINCIPAL: RoleEventHandlers;
  TEACHER: RoleEventHandlers;
  STUDENT: RoleEventHandlers;
}

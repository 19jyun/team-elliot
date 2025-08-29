// Socket.IO 이벤트 타입 정의
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

  // 수강신청 상태 변경 (실시간 업데이트용)
  enrollment_status_changed: {
    enrollmentId: number;
    status: string;
    data: any;
  };

  // 환불 요청 상태 변경 (실시간 업데이트용)
  refund_request_status_changed: {
    refundId: number;
    status: string;
    data: any;
  };

  // 세션 가용성 변경 (학생용)
  session_availability_changed: {
    sessionId: number;
    data: any;
  };

  // 클래스 가용성 변경 (학생용)
  class_availability_changed: {
    classId: number;
    data: any;
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

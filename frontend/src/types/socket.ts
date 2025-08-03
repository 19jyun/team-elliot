// Socket.IO 이벤트 타입 정의
export interface SocketEvents {
  // 연결 관련
  connection_confirmed: {
    userId: number;
    role: string;
    message: string;
  };

  // 수강신청 관련
  enrollment_status_changed: {
    enrollmentId: number;
    status: string;
    data: any;
    timestamp: string;
  };

  // 환불 요청 관련
  refund_request_status_changed: {
    refundId: number;
    status: string;
    data: any;
    timestamp: string;
  };

  // 클래스 정보 관련
  class_info_changed: {
    classId: number;
    data: any;
    timestamp: string;
  };

  // 클래스 가용성 변경
  class_availability_changed: {
    classId: number;
    data: any;
    timestamp: string;
  };

  // 세션 가용성 변경
  session_availability_changed: {
    sessionId: number;
    data: any;
    timestamp: string;
  };

  // 학원 정보 관련
  academy_info_changed: {
    academyId: number;
    data: any;
    timestamp: string;
  };

  // 수업 시간 알림
  class_reminder: {
    classId: number;
    classData: any;
    message: string;
    timestamp: string;
  };

  // 연결 상태 확인
  pong: {
    timestamp: string;
  };
}

// 클라이언트에서 서버로 보내는 이벤트 타입
export interface ClientSocketEvents {
  // 클래스 룸 참가/나가기
  join_class_room: { classId: number };
  leave_class_room: { classId: number };

  // 연결 상태 확인
  ping: void;
}

// Socket 이벤트 타입 추출
export type SocketEventName = keyof SocketEvents;
export type ClientEventName = keyof ClientSocketEvents;

// Socket 이벤트 데이터 타입
export type SocketEventData<T extends SocketEventName> = SocketEvents[T];
export type ClientEventData<T extends ClientEventName> = ClientSocketEvents[T];

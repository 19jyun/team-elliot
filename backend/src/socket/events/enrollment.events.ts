// 수강신청 관련 이벤트 타입들
export interface EnrollmentEvent {
  type: 'enrollment_created' | 'enrollment_status_changed';
  enrollmentId: number;
  studentId: number;
  classId: number;
  academyId: number;
  sessionId?: number;
  status: string;
  timestamp: Date;
}

export interface RefundEvent {
  type: 'refund_request_created' | 'refund_request_status_changed';
  refundId: number;
  enrollmentId: number;
  studentId: number;
  classId: number;
  academyId: number;
  teacherId?: number; // 담임 선생님 ID
  status: string;
  timestamp: Date;
}

export interface SessionAvailabilityEvent {
  type: 'session_availability_changed';
  sessionId: number;
  classId: number;
  academyId: number;
  currentStudents: number;
  maxStudents: number;
  isFull: boolean;
  timestamp: Date;
}

// Student 전용 데이터 타입 (Redux에서 관리하는 데이터만)

import type { ClassSession as Session } from "@/types/api/class-session";

interface StudentData {
  // 수강 신청/결제 내역
  enrollmentHistory: EnrollmentHistory[];

  // 환불/취소 내역
  cancellationHistory: CancellationHistory[];

  // 캘린더 세션 데이터 (새로 추가) - 실제로는 Session[] 타입
  calendarSessions: Session[];

  // 캘린더 범위 (새로 추가)
  calendarRange: {
    startDate: string;
    endDate: string;
  } | null;
}

// 수강중인 클래스 타입
export interface StudentClass {
  id: number;
  name: string;
  teacherName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  // 캘린더용 세션 데이터
  date?: string;
  currentStudents?: number;
  maxStudents?: number;
  classId?: number;
  isAlreadyEnrolled?: boolean;
  studentEnrollmentStatus?:
    | "PENDING"
    | "CONFIRMED"
    | "REJECTED"
    | "REFUND_REQUESTED";
  isOptimistic?: boolean; // 낙관적 업데이트용 플래그
  class?: {
    id: number;
    className: string;
    level: string;
    tuitionFee: number;
    teacher: {
      id: number;
      name: string;
    };
  };
}

// 수강 신청/결제 내역 타입
interface EnrollmentHistory {
  id: number;
  sessionId: number;
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacherName: string;
    };
  };
  enrolledAt: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "REFUND_REQUESTED";
  description?: string;
  // 거절 사유 정보
  enrollmentRejection?: RejectionDetail;
  refundRejection?: RejectionDetail;
}

// 환불/취소 내역 타입
interface CancellationHistory {
  id: number;
  sessionId: number;
  className: string;
  teacherName: string;
  sessionDate: string;
  sessionTime: string;
  refundAmount: number;
  status: "REFUND_REQUESTED" | "APPROVED" | "REJECTED";
  reason: string;
  detailedReason?: string;
  requestedAt: string;
  processedAt?: string;
  cancelledAt?: string;
  // 거절 사유 정보
  rejectionDetail?: RejectionDetail;
}

// 거절 사유 타입
interface RejectionDetail {
  id: number;
  reason: string;
  detailedReason?: string;
  rejectedAt: string;
  rejector: {
    id: number;
    name: string;
  };
}

// Student 상태 타입
export interface StudentState {
  data: StudentData | null;
  isLoading: boolean;
  error: string | null;
}

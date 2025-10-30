// Student 전용 데이터 타입 (Redux에서 관리하는 데이터만)

import type { ClassSession as Session } from "@/types/api/class-session";
import type {
  EnrollmentHistory,
  CancellationHistory,
} from "@/types/api/student";

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

// EnrollmentHistory와 CancellationHistory는 api/student.ts에서 import하여 사용

// Student 상태 타입
export interface StudentState {
  data: StudentData | null;
  isLoading: boolean;
  error: string | null;
}

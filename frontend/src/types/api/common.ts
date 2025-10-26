// === 공통으로 사용되는 타입들 ===

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

// 수강신청 상태 타입 (출석 상태 포함)
export type EnrollmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "REFUND_REQUESTED"
  | "REFUND_REJECTED_CONFIRMED"
  | AttendanceStatus;

// 출석 상태 타입 (백엔드 SessionEnrollment.status와 일치)
export type AttendanceStatus = "ATTENDED" | "ABSENT";

// 환불 상태 타입
export type RefundStatusType = "REFUND_REQUESTED" | "APPROVED" | "REJECTED";

// ===== 재사용 가능한 공통 도메인 베이스 =====

// 사람 참조(간략형)
export interface TeacherRef {
  id: number;
  name: string;
  photoUrl?: string;
}

// 클래스 참조(간략형)
export interface ClassRef {
  id: number;
  className: string;
}

// 클래스 기본 정보(여러 API에서 공통으로 쓰이는 최소 구조)
export interface ClassBase extends ClassRef {
  level: string;
  // 일부 API는 string, 일부는 number를 반환할 수 있어 union 허용
  tuitionFee: number | string;
}

// 세션 공통 코어(날짜/시간 식별자)
export interface SessionCore {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
}

// 클래스 세션 공통 베이스(클래스 연결은 API마다 유무가 달라 optional)
export interface ClassSessionBase extends SessionCore {
  classId?: number;
}

export type LevelType = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

// === Academy 관련 공통 타입들 ===

export interface AcademySummary {
  id: number;
  name: string;
  code: string;
}

export interface Academy extends AcademySummary {
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  joinedAt?: string; // 학생이 학원에 가입한 날짜 (학생용 API에서만 제공)
}

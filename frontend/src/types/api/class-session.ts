// Class-session 관련 API 타입들
// import type { EnrollmentStatus } from "./common"; // 사용하지 않음
import type { ClassSession, SessionEnrollment } from "./class";
import { UpdateEnrollmentStatusResponse } from "./teacher";

// 수강 신청 상태 enum
export enum SessionEnrollmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  ATTENDED = "ATTENDED",
  ABSENT = "ABSENT",
  COMPLETED = "COMPLETED",
}

// 클래스 세션 생성 요청 타입
export interface CreateClassSessionRequest {
  classId: number;
  date: Date;
  startTime: Date;
  endTime: Date;
}

// 클래스 세션 생성 응답 타입
export interface CreateClassSessionResponse {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 클래스 세션 수정 요청 타입
export interface UpdateClassSessionRequest {
  date?: Date;
  startTime?: Date;
  endTime?: Date;
}

// 클래스 세션 수정 응답 타입
export type UpdateClassSessionResponse = CreateClassSessionResponse;

// 클래스 세션 삭제 응답 타입
export interface DeleteClassSessionResponse {
  message: string;
}

// UpdateEnrollmentStatusRequest와 UpdateEnrollmentStatusResponse는 teacher.ts에서 정의됨

// 출석 체크 요청 타입
export interface CheckAttendanceRequest {
  status: "ATTENDED" | "ABSENT";
}

// 출석 체크 응답 타입
export type CheckAttendanceResponse = UpdateEnrollmentStatusResponse;

// 수업 완료 처리 응답 타입
export interface CompleteSessionsResponse {
  message: string;
  completedCount: number;
}

// 세션별 수강 신청 요청 타입
export interface EnrollSessionRequest {
  sessionId: number;
}

// 세션별 수강 신청 응답 타입
export interface EnrollSessionResponse {
  message: string;
  enrollment: {
    id: number;
    sessionId: number;
    studentId: number;
    status: SessionEnrollmentStatus;
    enrolledAt: string;
  };
}

// 수강 취소 응답 타입
export interface CancelEnrollmentResponse {
  message: string;
  enrollment: {
    id: number;
    sessionId: number;
    studentId: number;
    status: SessionEnrollmentStatus;
    cancelledAt: string;
  };
}

// 수강 신청 목록 조회 필터 타입
export interface EnrollmentFilters {
  status?: SessionEnrollmentStatus;
  classId?: number;
  sessionId?: number;
  startDate?: Date;
  endDate?: Date;
}

// 선생님의 수강 신청 목록 조회 응답 타입
export type GetTeacherEnrollmentsResponse = SessionEnrollment[];

// 학생의 수강 신청 목록 조회 응답 타입
export type GetStudentEnrollmentsResponse = SessionEnrollment[];

// 특정 세션의 수강생 목록 조회 응답 타입
export type GetSessionEnrollmentsResponse = SessionEnrollment[];

// 선택된 클래스들의 모든 세션 조회 응답 타입
export interface ClassSessionsForEnrollment {
  sessions: ClassSession[];
  calendarRange?: {
    startDate: string;
    endDate: string;
  };
}

// 학생의 특정 클래스 수강 신청 현황 조회 응답 타입
export interface StudentClassEnrollment {
  classId: number;
  className: string;
  sessions: Array<{
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    enrollment?: {
      id: number;
      status: SessionEnrollmentStatus;
      enrolledAt: string;
      cancelledAt?: string;
    };
  }>;
}

export type GetStudentClassEnrollmentsResponse = StudentClassEnrollment[];

// Re-export from class
export type { ClassSession };

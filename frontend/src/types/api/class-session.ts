// Class-session 관련 API 타입들
import type { EnrollmentStatus } from "./common";

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

// 수강 신청 상태 업데이트 요청 타입
export interface UpdateEnrollmentStatusRequest {
  status: SessionEnrollmentStatus;
  reason?: string;
}

// 수강 신청 상태 업데이트 응답 타입
export interface UpdateEnrollmentStatusResponse {
  id: number;
  sessionId: number;
  studentId: number;
  status: SessionEnrollmentStatus;
  reason?: string;
  enrolledAt: string;
  updatedAt: string;
}

// 배치 수강 신청 상태 업데이트 요청 타입
export interface BatchUpdateEnrollmentStatusRequest {
  enrollmentIds: number[];
  status: SessionEnrollmentStatus;
  reason?: string;
}

// 배치 수강 신청 상태 업데이트 응답 타입
export interface BatchUpdateEnrollmentStatusResponse {
  success: number;
  total: number;
}

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

// 여러 세션 일괄 수강 신청 요청 타입
export interface BatchEnrollSessionsRequest {
  sessionIds: number[];
}

// 여러 세션 일괄 수강 신청 응답 타입
export interface BatchEnrollSessionsResponse {
  message: string;
  enrollments: Array<{
    id: number;
    sessionId: number;
    studentId: number;
    status: SessionEnrollmentStatus;
    enrolledAt: string;
  }>;
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

// 수강 신청 정보 타입
export interface SessionEnrollment {
  id: number;
  sessionId: number;
  studentId: number;
  status: SessionEnrollmentStatus;
  reason?: string;
  enrolledAt: string;
  updatedAt: string;
  session: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    class: {
      id: number;
      className: string;
      teacher: {
        id: number;
        name: string;
      };
    };
  };
  student: {
    id: number;
    name: string;
    phoneNumber?: string;
  };
}

// 선생님의 수강 신청 목록 조회 응답 타입
export type GetTeacherEnrollmentsResponse = SessionEnrollment[];

// 학생의 수강 신청 목록 조회 응답 타입
export type GetStudentEnrollmentsResponse = SessionEnrollment[];

// 특정 세션의 수강생 목록 조회 응답 타입
export type GetSessionEnrollmentsResponse = SessionEnrollment[];

// 클래스별 세션 목록 조회 응답 타입
export interface ClassSession {
  id: number;
  classId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  currentStudents: number;
  maxStudents: number;
  isEnrollable?: boolean;
  isFull?: boolean;
  isPastStartTime?: boolean;
  isAlreadyEnrolled?: boolean;
  studentEnrollmentStatus?: EnrollmentStatus | null;

  // 클래스 정보 (백엔드 API 응답에 포함됨)
  class?: {
    id: number;
    className: string;
    level: string;
    tuitionFee: string;
    teacher?: {
      id: number;
      name: string;
    };
  };

  // 선생님 이름 (백엔드 API 응답에 포함됨)
  teacherName?: string;
}

export type GetClassSessionsResponse = ClassSession[];

// 수강 변경용 클래스 세션 목록 조회 응답 타입
export interface ClassSessionForModification extends ClassSession {
  isSelectable: boolean;
  canBeCancelled: boolean;
  isModifiable: boolean;
}

export type GetClassSessionsForModificationResponse =
  ClassSessionForModification[];

// 선택된 클래스들의 모든 세션 조회 응답 타입
export interface ClassSessionsForEnrollment {
  sessions: ClassSession[];
  calendarRange?: {
    startDate: string;
    endDate: string;
  };
}

export type GetClassSessionsForEnrollmentResponse =
  ClassSessionsForEnrollment[];

// 학생의 수강 가능한 모든 세션 조회 응답 타입
export type GetStudentAvailableSessionsForEnrollmentResponse = ClassSession[];

// 수강 변경 요청 타입
export interface ChangeEnrollmentRequest {
  newSessionId: number;
  reason?: string;
}

// 수강 변경 응답 타입
export interface ChangeEnrollmentResponse {
  message: string;
  cancelledEnrollment: {
    id: number;
    status: SessionEnrollmentStatus;
    cancelledAt: string;
  };
  newEnrollment: {
    id: number;
    status: SessionEnrollmentStatus;
    enrolledAt: string;
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

// 배치 수강 변경/취소 처리 요청 타입
export interface BatchModifyEnrollmentsRequest {
  cancellations: number[];
  newEnrollments: number[];
  reason?: string;
}

// 배치 수강 변경/취소 처리 응답 타입
export interface BatchModifyEnrollmentsResponse {
  success: boolean;
  cancelledCount: number;
  enrolledCount: number;
  message: string;
}

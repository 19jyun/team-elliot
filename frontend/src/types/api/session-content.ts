import { BalletPose } from "./ballet-pose";
import type { CreateSessionContentRequest } from "./principal";

export interface SessionContent {
  id: number;
  sessionId: number;
  poseId: number;
  order: number;
  notes?: string;
  createdAt: string;
  pose: BalletPose;
}

export interface SessionContentResponse {
  sessionSummary?: string;
  contents: SessionContent[];
}

export type { CreateSessionContentRequest };

export interface UpdateSessionContentRequest {
  poseId?: number;
  order?: number;
  notes?: string;
}

export interface ReorderSessionContentsRequest {
  // 백엔드 DTO는 contentIds: string[] 요구 (숫자 문자열 배열)
  contentIds: string[];
}

// CreateSessionContentResponse는 principal.ts에서 import됨;

// 세션 컨텐츠 수정 응답 타입
export type UpdateSessionContentResponse = SessionContent;

// 세션 컨텐츠 삭제 응답 타입
export interface DeleteSessionContentResponse {
  message: string;
}

// 세션 컨텐츠 순서 변경 응답 타입
export interface ReorderSessionContentsResponse {
  message: string;
  contents: SessionContent[];
}

export interface CheckAttendanceRequest {
  status: "PRESENT" | "ABSENT";
}

export interface CheckAttendanceResponse {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  student: {
    id: number;
    name: string;
    phoneNumber: string;
  };
}

export interface BatchCheckAttendanceRequest {
  attendances: Array<{
    enrollmentId: number;
    status: "PRESENT" | "ABSENT";
  }>;
}

// 출석 항목 타입을 별도로 export (재사용용)
export type AttendanceItem = BatchCheckAttendanceRequest["attendances"][number];

export interface BatchCheckAttendanceResponse {
  sessionId: number;
  totalCount: number;
  results: Array<{
    enrollmentId: number;
    status: "PRESENT" | "ABSENT";
    attendance: {
      id: number;
      sessionEnrollmentId: number;
      classId: number;
      studentId: number;
      date: string;
      status: "PRESENT" | "ABSENT";
      note?: string | null;
    };
  }>;
}

// 새로운 포즈 리스트 업데이트 요청 타입
export interface UpdateSessionPosesRequest {
  poseIds: number[];
  notes?: string[];
}

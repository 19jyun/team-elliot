import { get, post } from "./apiClient";
import {
  GetClassSessionsResponse,
  BatchEnrollSessionsRequest,
  BatchEnrollSessionsResponse,
  StudentClassEnrollmentsResponse,
  BatchModifyEnrollmentsRequest,
  BatchModifyEnrollmentsResponse,
} from "../types/api/class";

// ClassSession 관련 API 함수들
export const getClassSessions = (
  classId: number
): Promise<GetClassSessionsResponse> => get(`/class-sessions/class/${classId}`);

export const getClassSession = (sessionId: number) =>
  get(`/class-sessions/${sessionId}`);

export const enrollSession = (sessionId: number) =>
  post(`/class-sessions/${sessionId}/enroll`);

export const batchEnrollSessions = (
  sessionIds: number[]
): Promise<BatchEnrollSessionsResponse> =>
  post("/class-sessions/batch-enroll", { sessionIds });

// 학생의 특정 클래스 수강 신청 현황 조회 (수강 변경/취소용)
export const getStudentClassEnrollments = (
  classId: number
): Promise<StudentClassEnrollmentsResponse> =>
  get(`/class-sessions/class/${classId}/student-enrollments`);

// 수강 취소
export const cancelEnrollment = (enrollmentId: number) =>
  post(`/class-sessions/enrollments/${enrollmentId}/cancel`);

// 수강 변경 (기존 수강 취소 + 새로운 수강 신청)
export const changeEnrollment = (
  enrollmentId: number,
  newSessionId: number,
  reason?: string
) =>
  post(`/class-sessions/enrollments/${enrollmentId}/change`, {
    newSessionId,
    reason,
  });

// 배치 수강 변경/취소 처리
export const batchModifyEnrollments = (
  data: BatchModifyEnrollmentsRequest
): Promise<BatchModifyEnrollmentsResponse> =>
  post("/class-sessions/batch-modify", data);

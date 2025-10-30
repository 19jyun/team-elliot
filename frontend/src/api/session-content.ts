import { get, post, put, del } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  CreateSessionContentRequest,
  ReorderSessionContentsRequest,
  SessionContent,
  SessionContentResponse,
  DeleteSessionContentResponse,
  ReorderSessionContentsResponse,
  CheckAttendanceRequest,
  CheckAttendanceResponse,
  UpdateSessionPosesRequest,
  BatchCheckAttendanceRequest,
  BatchCheckAttendanceResponse,
} from "@/types/api/session-content";

// 세션 내용 목록 조회
export const getSessionContents = (
  sessionId: number
): Promise<ApiResponse<SessionContentResponse>> => {
  return get<ApiResponse<SessionContentResponse>>(
    `/class-sessions/${sessionId}/contents`
  );
};

// 세션 내용 추가
export const createSessionContent = (
  sessionId: number,
  data: CreateSessionContentRequest
): Promise<ApiResponse<SessionContent>> => {
  return post<ApiResponse<SessionContent>>(
    `/class-sessions/${sessionId}/contents`,
    data
  );
};

// 세션 내용 삭제
export const deleteSessionContent = (
  sessionId: number,
  contentId: number
): Promise<ApiResponse<DeleteSessionContentResponse>> => {
  return del<ApiResponse<DeleteSessionContentResponse>>(
    `/class-sessions/${sessionId}/contents/${contentId}`
  );
};

// 세션 내용 순서 변경
export const reorderSessionContents = (
  sessionId: number,
  data: ReorderSessionContentsRequest
): Promise<ApiResponse<ReorderSessionContentsResponse>> => {
  return put<ApiResponse<ReorderSessionContentsResponse>>(
    `/class-sessions/${sessionId}/contents/reorder`,
    data
  );
};

// 세션 자세 목록 전체 업데이트 (새로운 방식)
export const updateSessionPoses = (
  sessionId: number,
  data: UpdateSessionPosesRequest
): Promise<ApiResponse<SessionContent[]>> => {
  return put<ApiResponse<SessionContent[]>>(
    `/class-sessions/${sessionId}/contents/poses`,
    data
  );
};

// 출석 체크
export const checkAttendance = (
  enrollmentId: number,
  data: CheckAttendanceRequest
): Promise<ApiResponse<CheckAttendanceResponse>> => {
  return put<ApiResponse<CheckAttendanceResponse>>(
    `/class-sessions/enrollments/${enrollmentId}/attendance`,
    data
  );
};

// 일괄 출석 체크
export const batchCheckAttendance = (
  sessionId: number,
  data: BatchCheckAttendanceRequest
): Promise<ApiResponse<BatchCheckAttendanceResponse>> => {
  return put<ApiResponse<BatchCheckAttendanceResponse>>(
    `/class-sessions/${sessionId}/attendances`,
    data
  );
};

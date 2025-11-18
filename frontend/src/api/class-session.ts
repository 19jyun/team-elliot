import { get, post } from "./apiClient";
import type { ApiResponse } from "@/types/api";
import type { ClassSession } from "@/types/api/class";

// 클래스별 세션 목록 조회
export const getClassSessions = (
  classId: number
): Promise<ApiResponse<ClassSession[]>> => {
  return get<ApiResponse<ClassSession[]>>(`/class-sessions/class/${classId}`);
};

// 세션별 수강 신청
export const enrollSession = (
  sessionId: number
): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return post<ApiResponse<{ success: boolean; message: string }>>(
    `/class-sessions/${sessionId}/enroll`
  );
};

// 배치 수강 신청
export const batchEnrollSessions = (data: {
  sessionIds: number[];
}): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return post<ApiResponse<{ success: boolean; message: string }>>(
    "/class-sessions/enrollments/bulk",
    data
  );
};

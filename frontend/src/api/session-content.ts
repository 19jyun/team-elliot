import axiosInstance from "@/lib/axios";
import {
  SessionContent,
  CreateSessionContentRequest,
  UpdateSessionContentRequest,
  ReorderSessionContentsRequest,
} from "@/types/api/session-content";

// 세션 내용 목록 조회
export const getSessionContents = async (
  sessionId: number
): Promise<SessionContent[]> => {
  const response = await axiosInstance.get(
    `/class-sessions/${sessionId}/contents`
  );
  return response.data;
};

// 세션 내용 상세 조회
export const getSessionContent = async (
  sessionId: number,
  contentId: number
): Promise<SessionContent> => {
  const response = await axiosInstance.get(
    `/class-sessions/${sessionId}/contents/${contentId}`
  );
  return response.data;
};

// 세션 내용 추가
export const addSessionContent = async (
  sessionId: number,
  data: CreateSessionContentRequest
): Promise<SessionContent> => {
  const response = await axiosInstance.post(
    `/class-sessions/${sessionId}/contents`,
    data
  );
  return response.data;
};

// 세션 내용 수정
export const updateSessionContent = async (
  sessionId: number,
  contentId: number,
  data: UpdateSessionContentRequest
): Promise<SessionContent> => {
  const response = await axiosInstance.patch(
    `/class-sessions/${sessionId}/contents/${contentId}`,
    data
  );
  return response.data;
};

// 세션 내용 삭제
export const deleteSessionContent = async (
  sessionId: number,
  contentId: number
): Promise<void> => {
  await axiosInstance.delete(
    `/class-sessions/${sessionId}/contents/${contentId}`
  );
};

// 세션 내용 순서 변경
export const reorderSessionContents = async (
  sessionId: number,
  data: ReorderSessionContentsRequest
): Promise<SessionContent[]> => {
  const response = await axiosInstance.patch(
    `/class-sessions/${sessionId}/contents/reorder`,
    data
  );
  return response.data;
};

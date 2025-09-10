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
  data: SessionContent[];
}

export type { CreateSessionContentRequest };

export interface UpdateSessionContentRequest {
  poseId?: number;
  order?: number;
  notes?: string;
}

export interface ReorderSessionContentsRequest {
  // 백엔드 DTO는 contentIds: string[] 요구
  contentIds: Array<string | number>;
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

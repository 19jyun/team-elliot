import { BalletPose } from "./ballet-pose";

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

export interface CreateSessionContentRequest {
  poseId: number;
  order?: number;
  notes?: string;
}

export interface UpdateSessionContentRequest {
  poseId?: number;
  order?: number;
  notes?: string;
}

export interface ReorderSessionContentsRequest {
  contentIds: string[];
}
